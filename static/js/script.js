let allMembers = [];
let currentEditId = null;

async function loadMembers() {
    try {
        const res = await fetch('/api/members');
        allMembers = await res.json();
        renderTable(allMembers);
        renderStats(allMembers);
        document.getElementById('totalCount').textContent = `(${allMembers.length})`;
    } catch (e) {
        alert('❌ MongoDB connect nahi ho raha. mongod running hai?');
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No members yet. Add some!</td></tr>`;
        return;
    }

    data.forEach(m => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${m.name}</td>
            <td>${m.age}</td>
            <td><span class="badge bg-success badge-plan">${m.plan}</span></td>
            <td>${m.joining_date}</td>
            <td>${m.trainer_name}</td>
            <td class="text-end">
                <button onclick="editMember('${m._id}')" class="btn btn-sm btn-outline-success me-2"><i class="bi bi-pencil"></i></button>
                <button onclick="deleteMember('${m._id}')" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>`;
        tbody.appendChild(row);
    });
}

function renderStats(data) {
    const total = data.length;
    const monthly = data.filter(m => m.plan === 'Monthly').length;
    const yearly = data.filter(m => m.plan === 'Yearly' || m.plan === 'Annual').length;

    document.getElementById('statsRow').innerHTML = `
        <div class="col-md-4"><div class="card p-4 text-center"><h3 class="text-success">${total}</h3><p class="mb-0">Total Members</p></div></div>
        <div class="col-md-4"><div class="card p-4 text-center"><h3 class="text-primary">${monthly}</h3><p class="mb-0">Monthly Plans</p></div></div>
        <div class="col-md-4"><div class="card p-4 text-center"><h3 class="text-warning">${yearly}</h3><p class="mb-0">Yearly / Annual Plans</p></div></div>`;
}

function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMembers.filter(m => 
        m.name.toLowerCase().includes(query) || 
        (m.trainer_name && m.trainer_name.toLowerCase().includes(query))
    );
    renderTable(filtered);
}

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New Member';
    document.getElementById('memberForm').reset();
    // Default joining date = today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('joiningDate').value = today;
    new bootstrap.Modal(document.getElementById('memberModal')).show();
}

async function editMember(id) {
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Update Member';
    const res = await fetch(`/api/members/${id}`);
    const m = await res.json();

    document.getElementById('name').value = m.name;
    document.getElementById('age').value = m.age;
    document.getElementById('plan').value = m.plan;
    document.getElementById('joiningDate').value = m.joining_date;
    document.getElementById('trainer').value = m.trainer_name;

    new bootstrap.Modal(document.getElementById('memberModal')).show();
}

async function saveMember() {
    const data = {
        name: document.getElementById('name').value.trim(),
        age: parseInt(document.getElementById('age').value),
        plan: document.getElementById('plan').value,
        joining_date: document.getElementById('joiningDate').value,
        trainer_name: document.getElementById('trainer').value.trim()
    };

    if (!data.name || !data.age || !data.trainer_name) {
        alert('Bhai sab fields bhar do!');
        return;
    }

    const url = currentEditId ? `/api/members/${currentEditId}` : '/api/members';
    const method = currentEditId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
        loadMembers();
        alert(currentEditId ? '✅ Updated in MongoDB!' : '🎉 New member added in MongoDB!');
    }
}

async function deleteMember(id) {
    if (!confirm('Pakka delete karna hai MongoDB se?')) return;
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    loadMembers();
}

// Start the system
window.onload = () => {
    loadMembers();
    console.log('%c🏋️‍♂️ Gym Membership System Ready! MongoDB Live hai bhai!', 'color:#00ff88; font-size:14px');
};