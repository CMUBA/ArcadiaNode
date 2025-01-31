<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 测试页面</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .service-section { margin-bottom: 20px; }
        .service-section h2 { margin-bottom: 10px; }
        .input-group { margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>API 测试页面</h1>
    <div class="service-section" id="auth-service">
        <h2>认证服务</h2>
        <div class="input-group">
            <label for="auth-input">输入：</label>
            <input type="text" id="auth-input" placeholder="输入参数">
        </div>
        <button onclick="testAuthService()">测试认证服务</button>
        <div id="auth-result"></div>
    </div>
    <script>
        function testAuthService() {
            const input = document.getElementById('auth-input').value;
            fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('auth-result').innerText = JSON.stringify(data);
            })
            .catch(error => {
                document.getElementById('auth-result').innerText = 'Error: ' + error;
            });
        }
    </script>
</body>
</html> 