let myPeerId = '';
let activeConnection = null;

// 1. 初始化 Peer，连接到 PeerJS 的免费服务器
const peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    debug: 2 // 可选，在控制台查看连接日志
});

// 2. 当获得自己的ID时
peer.on('open', (id) => {
    myPeerId = id;
    document.getElementById('myId').textContent = id;
    logMessage('系统', '已就绪。请将你的ID告诉朋友，或在上方输入朋友的ID进行连接。', 'system');
});

// 3. 当有人尝试连接你时
peer.on('connection', (conn) => {
    if (activeConnection && activeConnection.open) {
        conn.close();
        logMessage('系统', '已有连接，拒绝新的请求。', 'system');
        return;
    }
    setupConnection(conn);
    logMessage('系统', `已与 ${conn.peer} 连接！`, 'system');
});

// 4. 主动连接朋友
window.connectToPeer = function() {
    const friendId = document.getElementById('friendId').value.trim();
    if (!friendId) return alert('请输入对方的ID');
    if (activeConnection && activeConnection.open) {
        alert('请先断开当前连接');
        return;
    }
    const conn = peer.connect(friendId, { reliable: true });
    setupConnection(conn);
};

// 5. 设置连接的事件处理
function setupConnection(conn) {
    activeConnection = conn;
    conn.on('open', () => {
        logMessage('系统', `连接成功！可以开始聊天了。`, 'system');
    });
    conn.on('data', (data) => {
        logMessage('对方', data, 'remote');
    });
    conn.on('close', () => {
        logMessage('系统', '连接已断开。', 'system');
        activeConnection = null;
    });
}

// 6. 发送消息
window.sendMessage = function() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;
    if (activeConnection && activeConnection.open) {
        activeConnection.send(message);
        logMessage('我', message, 'self');
        input.value = '';
        input.focus();
    } else {
        alert('尚未建立连接！');
    }
};

// 7. 在聊天框显示消息
function logMessage(sender, text, type) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}