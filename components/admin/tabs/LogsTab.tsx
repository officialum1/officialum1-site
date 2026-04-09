"use client";

interface LogsTabProps {
    logs: any[];
}

export default function LogsTab({ logs }: LogsTabProps) {
    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Security & Activity Logs</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Time</th>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                            <th style={{ padding: '1rem' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs && logs.length > 0 ? logs.map((log: any) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{log.date ? new Date(log.date).toLocaleString() : 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>{log.user}</td>
                                <td style={{ padding: '1rem' }}><span style={{ color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{log.action}</span></td>
                                <td style={{ padding: '1rem', color: '#ccc' }}>{log.details}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No logs recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
