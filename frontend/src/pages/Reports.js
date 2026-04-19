import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Filter, TrendingDown, AlertTriangle } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function Reports() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [summary, setSummary] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // /courses already returns only THIS faculty's courses
    api.get('/courses').then(r => {
      const fetchedCourses = r.data.courses;
      setCourses(fetchedCourses);

      // Derive students only from faculty's own courses
      const studentMap = new Map();
      fetchedCourses.forEach(course => {
        course.students?.forEach(s => {
          if (s._id && !studentMap.has(s._id)) {
            studentMap.set(s._id, s);
          }
        });
      });
      setStudents(Array.from(studentMap.values()));
    });
  }, []);

  const filteredCourses = selectedStudent
    ? courses.filter(c => c.students?.some(s => s._id === selectedStudent || s === selectedStudent))
    : courses;

  const fetchReport = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const params = selectedCourse ? `?courseId=${selectedCourse}` : '';
      const res = await api.get(`/attendance/summary/${selectedStudent}${params}`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCourse('');
    if (selectedStudent) fetchReport();
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedStudent) fetchReport();
  }, [selectedCourse]);

  // ✅ Key fix: only show courses this faculty teaches
  const filteredSummary = summary.filter(s =>
    courses.some(c => c._id === s.course._id)
  );

  const chartData = filteredSummary.map(s => ({
    name: s.course.code,
    present: s.present,
    absent: s.absent,
    late: s.late,
    percentage: s.percentage
  }));

  const overallStats = filteredSummary.reduce((acc, s) => ({
    totalClasses: acc.totalClasses + s.totalClasses,
    present: acc.present + s.present,
    absent: acc.absent + s.absent,
    late: acc.late + s.late,
  }), { totalClasses: 0, present: 0, absent: 0, late: 0 });

  const shortage = filteredSummary.filter(s => s.isShortage && s.totalClasses > 0);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Attendance Reports</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Analyze attendance patterns and generate reports</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} />Filter Options
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 7 }}>Select Student *</label>
            <select
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 10, width: '100%', padding: '8px 12px', color: '#f1f5f9' }}
            >
              <option value="">-- All Students --</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 7 }}>Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 10, width: '100%', padding: '8px 12px', color: '#f1f5f9' }}
            >
              <option value="">All Courses</option>
              {filteredCourses.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedStudent && filteredSummary.length > 0 && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Classes', value: overallStats.totalClasses, color: '#64748b' },
              { label: 'Present', value: overallStats.present, color: '#10b981' },
              { label: 'Absent', value: overallStats.absent, color: '#ef4444' },
              { label: 'Late', value: overallStats.late, color: '#f59e0b' },
              {
                label: 'Overall %',
                value: `${overallStats.totalClasses > 0
                  ? ((overallStats.present + overallStats.late) / overallStats.totalClasses * 100).toFixed(1)
                  : 0}%`,
                color: ((overallStats.present + overallStats.late) / (overallStats.totalClasses || 1) * 100) >= 75
                  ? '#10b981' : '#ef4444'
              }
            ].map(s => (
              <div key={s.label} style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Syne', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Shortage warning */}
          {shortage.length > 0 && (
            <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>Attendance Shortage Warning</p>
                <p style={{ fontSize: 13, color: '#ef4444', opacity: 0.8 }}>
                  Below 75% in: {shortage.map(s => `${s.course.code} (${s.percentage}%)`).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Detailed table */}
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a2235' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Course-wise Breakdown</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d1526', borderBottom: '1px solid #1a2235' }}>
                  {['Course', 'Total', 'Present', 'Absent', 'Late', 'Excused', 'Percentage', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map(s => (
                  <tr key={s.course._id} style={{ borderBottom: '1px solid #0f1a2e' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{s.course.name}</div>
                      <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{s.course.code}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{s.totalClasses}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ color: '#10b981', fontWeight: 600 }}>{s.present}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ color: '#ef4444', fontWeight: 600 }}>{s.absent}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ color: '#f59e0b', fontWeight: 600 }}>{s.late}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ color: '#3b82f6', fontWeight: 600 }}>{s.excused}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: '#1a2235', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.percentage}%`, background: s.isShortage ? '#ef4444' : '#10b981', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.isShortage ? '#ef4444' : '#10b981' }}>{s.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.isShortage ? '#ef444422' : '#10b98122', color: s.isShortage ? '#ef4444' : '#10b981', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                        {s.isShortage ? '⚠ Shortage' : '✓ Good'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedStudent && filteredSummary.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <TrendingDown size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No attendance data found for this student</p>
        </div>
      )}

      {!selectedStudent && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569', background: '#111827', border: '1px solid #1e2d45', borderRadius: 16 }}>
          <Filter size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>Select a student to generate their attendance report</p>
        </div>
      )}
    </div>
  );
}