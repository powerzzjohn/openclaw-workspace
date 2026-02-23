// 简单的数据库测试脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 成功连接到 SQLite 数据库');
});

// 创建测试表
db.run(`
  CREATE TABLE IF NOT EXISTS test_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ 创建表失败:', err.message);
  } else {
    console.log('✅ 测试表创建成功');
  }
});

// 插入测试数据
db.run(`
  INSERT OR IGNORE INTO test_users (id, email) 
  VALUES ('test-001', 'test@fanren.com')
`, function(err) {
  if (err) {
    console.error('❌ 插入数据失败:', err.message);
  } else {
    console.log('✅ 测试数据插入成功');
  }
});

// 查询测试数据
db.all(`SELECT * FROM test_users`, [], (err, rows) => {
  if (err) {
    console.error('❌ 查询失败:', err.message);
  } else {
    console.log('✅ 查询成功:', rows);
  }
  
  // 关闭数据库
  db.close((err) => {
    if (err) {
      console.error('❌ 关闭数据库失败:', err.message);
    } else {
      console.log('✅ 数据库连接已关闭');
      console.log('\n🎉 数据库测试完成！SQLite 工作正常。');
    }
  });
});
