const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQLに接続
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chibi2007",
    database: "testdb"
});

// データを取るAPI
app.get("/question_list", (req, res) => {
    db.query("SELECT * FROM question_list", (err, results) => {
        if (err) {
            console.error("エラー:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// データを追加
app.post("/add-text", (req, res) => {
    const { text, answer, category, level} = req.body;
    const  sql = "INSERT INTO question_list (text, answer, category, level) VALUES (?, ?, ?, ?)";

    db.query(sql, [text, answer, category, level], (err, result) => {
        if (err) {
            console.error("保存エラー:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "保存成功", id: result.insertId });
    });
});

// データの削除
app.delete("/delete-text/:id", (req, res) => {
    const id =req.params.id;    // URLの末尾でID取得
    const  sql = "DELETE FROM question_list WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("削除エラー：", err);
            return res.status(500).json(err);
        }
        res.json({ message: "削除に成功しました"});
    });
});

// 指定されたデータのみ返す
app.get("/update-text/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM question_list WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);   //  1件のみ
    });
});

// 編集したデータの更新
app.put("/update-text/:id", (req, res) => {
    const id = req.params.id;
    const { text, answer, category, level } = req.body;
    const sql = "UPDATE question_list SET text = ?, answer = ?, category = ?, level = ? WHERE id = ?";

    db.query(sql, [text, answer, category, level, id], (err, result) => {
        if(err) {
            console.error("SQLエラー：", err);
            return res.status(500).json(err);
        }
        res.json({ message: "更新に成功しました"})
    });
});

// 検索
app.get("/search", (req, res) => {
    const { category, level } = req.query;

    let sql = "SELECT * FROM question_list WHERE 1=1";
    let params = [];

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }
    if (level) {
        sql += " AND level = ?";
        params.push(level);
    }

    db.query(sql, params, (err, results) => {
        if(err) {
            console.error("検索エラー：", err);
            return res.status(500).json({ error: "検索に失敗しました"});
        }
        res.json(results);
    });
});


// サーバー起動
app.listen(3000, () => console.log("http://localhost:3000"));
