const API_URL = 'https://edufeedback-system-jc9d.onrender.com/api';

function checkAuth(role) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== role) {
        window.location.href = 'login.html';
        return null;
    }
    return { token, user };
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

// Format date helper
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString();
}

async function exportReport() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
}
