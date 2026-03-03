const { domain, apikey, nestid, egg, loc, resourceMap, subdomain } = config;
const output = document.getElementById('output-box');

// Auto Load Dropdown
window.onload = () => {
    const pkgSelect = document.getElementById('pkgSelect');
    const domSelect = document.getElementById('domSelect');
    Object.keys(resourceMap).forEach(key => pkgSelect.add(new Option(key.toUpperCase(), key)));
    Object.keys(subdomain).forEach(dom => domSelect.add(new Option(dom, dom)));
};

function randomStr(len = 3) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 1. CREATE SERVER
document.getElementById('btnCreate').addEventListener('click', async () => {
    const user = document.getElementById('userInput').value.toLowerCase().trim();
    const pkg = document.getElementById('pkgSelect').value;
    if(!user) return alert("Isi username pembeli!");

    output.innerText = "⏳ Sedang memproses User & Server...";
    const { ram, disk, cpu } = resourceMap[pkg];
    const password = user + randomStr(3);

    try {
        const uRes = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
            body: JSON.stringify({ email: `${user}@ReyzCloud.com`, username: user, first_name: user.toUpperCase(), last_name: "Server", language: "en", password })
        });
        const uData = await uRes.json();
        if(uData.errors) throw new Error(uData.errors[0].detail);

        const sRes = await fetch(`${domain}/api/application/servers`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
            body: JSON.stringify({
                name: user.toUpperCase() + " SERVER",
                user: uData.attributes.id,
                egg: parseInt(egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
                startup: "npm start",
                environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
                limits: { memory: ram, swap: 0, disk, io: 500, cpu },
                feature_limits: { databases: 5, backups: 5, allocations: 5 },
                deploy: { locations: [parseInt(loc)], dedicated_ip: false, port_range: [] }
            })
        });
        const sData = await sRes.json();
        output.innerHTML = `✅ <b>BERHASIL!</b>\n\nUser: ${user}\nPass: ${password}\nRAM: ${ram}MB\nID Server: ${sData.attributes.id}`;
    } catch(e) { output.innerText = "❌ Error: " + e.message; }
});

// 2. LIST SERVER
document.getElementById('btnList').addEventListener('click', async () => {
    output.innerText = "⏳ Loading server list...";
    try {
        const res = await fetch(`${domain}/api/application/servers`, { headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } });
        const data = await res.json();
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";
        data.data.forEach(srv => {
            const s = srv.attributes;
            tbody.innerHTML += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.limits.memory}MB</td><td>${s.limits.disk}MB</td></tr>`;
        });
        output.innerText = `✅ Berhasil memuat ${data.data.length} server.`;
    } catch(e) { output.innerText = "❌ Gagal memuat data."; }
});

// 3. SUBDOMAIN CLOUDFLARE
document.getElementById('btnSubdo').addEventListener('click', async () => {
    const tld = document.getElementById('domSelect').value;
    const host = document.getElementById('hostInput').value.trim().toLowerCase();
    const ip = document.getElementById('ipInput').value.trim();
    if(!host || !ip) return alert("Input tidak lengkap!");

    output.innerText = "⏳ Menghubungkan ke Cloudflare...";
    const cfReq = (name) => fetch(`https://api.cloudflare.com/client/v4/zones/${subdomain[tld].zone}/dns_records`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${subdomain[tld].apitoken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "A", name: `${name}.${tld}`, content: ip, ttl: 3600, proxied: false })
    }).then(r => r.json());

    try {
        const r1 = await cfReq(host);
        if(!r1.success) throw new Error(r1.errors[0].message);
        const r2 = await cfReq(`node-${randomStr(2)}.${host}`);
        output.innerHTML = `✅ <b>Subdomain Aktif!</b>\n🌍 IP: ${ip}\n📌 Panel: ${r1.result.name}\n🖥️ Node: ${r2.result.name}`;
    } catch(e) { output.innerText = "❌ CF Error: " + e.message; }
});

// 4. DELETE SERVER
document.getElementById('btnDelServer').addEventListener('click', async () => {
    const id = document.getElementById('idTarget').value;
    if(!id || !confirm("Yakin hapus server & user ini?")) return;
    output.innerText = "⏳ Sedang menghapus...";
    try {
        const sRes = await fetch(`${domain}/api/application/servers/${id}`, { headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } });
        const sData = await sRes.json();
        const uName = sData.attributes.name.split(' ')[0].toLowerCase();
        await fetch(`${domain}/api/application/servers/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${apikey}` } });
        const uList = await fetch(`${domain}/api/application/users`, { headers: { "Authorization": `Bearer ${apikey}`, "Accept": "application/json" } }).then(r => r.json());
        const target = uList.data.find(u => u.attributes.username === uName);
        if(target) await fetch(`${domain}/api/application/users/${target.attributes.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${apikey}` } });
        output.innerText = "✅ Server & Akun berhasil dihapus!";
    } catch(e) { output.innerText = "❌ Gagal menghapus."; }
});

// 5. ADMIN MANAGE
document.getElementById('btnCreateAdmin').addEventListener('click', async () => {
    const user = document.getElementById('adminUsername').value.toLowerCase().trim();
    if(!user) return alert("Username admin kosong!");
    const pass = user + randomStr(3);
    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
            body: JSON.stringify({ email: `${user}@ReyzAdmin.com`, username: user, first_name: user.toUpperCase(), last_name: "ROOT", root_admin: true, language: "en", password: pass })
        });
        const data = await res.json();
        if(data.errors) throw new Error(data.errors[0].detail);
        output.innerHTML = `👑 <b>ADMIN DIBUAT!</b>\n\nUser: ${user}\nPass: ${pass}`;
    } catch(e) { output.innerText = "❌ Error: " + e.message; }
});

document.getElementById('btnDelAdmin').addEventListener('click', async () => {
    const id = document.getElementById('idAdminTarget').value;
    if(!id || !confirm("Hapus Admin ID: " + id + "?")) return;
    try {
        const res = await fetch(`${domain}/api/application/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${apikey}` } });
        if(!res.ok) throw new Error("Gagal menghapus admin.");
        output.innerText = "✅ Akun Admin berhasil dihapus!";
    } catch(e) { output.innerText = "❌ Error: " + e.message; }
});
