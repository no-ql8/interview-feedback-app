const newModal = document.getElementById('newModal');
const newOpenButton = document.getElementById('open-btn');
const newCloseBtn = document.querySelector(".new-close-btn");

const editModal = document.getElementById("editModal");
const newEditBtn = document.getElementById("newEditBtn");
const editCloseBtn = document.querySelector(".edit-close-btn");

const deleteModal = document.getElementById("delete_modal");
const deleteYes = document.getElementById("delete-yes");
const  deleteNo = document.getElementById("delete-no");
const deleteCloseBtn = document.querySelector(".delete-close-btn");

const searchBtn = document.getElementById("search-btn");
const searchResetBtn = document.getElementById("searchReset-btn");

let QIndexDelete = null;
let currentEditID = null;
const qList = document.getElementById("q-list")
const categoryData = document.getElementById("category-new")
const levelData = document.getElementById("level-new")
const textData = document.getElementById("q-text")
const registerBtn = document.getElementById("register-btn")



/* 新規登録ポップアップON/OFF */
newOpenButton.onclick = () => {
    newModal.style.display = "block";
};

newCloseBtn.onclick = () => {
    newModal.style.display = "none";
};

// 新規登録の「登録」ボタン押したとき
registerBtn.onclick = () => {
    const text = textData.value;
    const category = categoryData.value;
    const level = levelData.value;

    if (text !== "") {

        const newText = {
            text: text,
            category: category,
            level: level
        };

        fetch("http://localhost:3000/add-text", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(newText)
        })
            .then(res => res.json())
            .then(data => {
                console.log("保存されました：", data);

                loadQuestions();
                resetForm();
                newModal.style.display = "none";
            })
            .catch(err => console.error("保存失敗：", err))
    }
}

// 編集画面の登録を押したとき
newEditBtn.onclick = () => {
    // 編集してもらったデータを保存
    const editData = {
        text: document.getElementById("text-edit").value,
        answer:document.getElementById("answer-edit").value,
        category:document.getElementById('category-edit').value,
        level:document.getElementById('level-edit').value
    };
    fetch(`http://localhost:3000/update-text/${currentEditID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
    })
        .then(res => res.json())
        .then(data => {
            console.log("更新成功");
            loadQuestions();
            editModal.style.display = "none";
        })
        .catch(err => console.error("更新エラー：", err));

}
editCloseBtn.onclick = () => {
    editModal.style.display = "none";
};

/* 削除ポップアップON/OFF */
deleteYes.onclick = () => {
    if(QIndexDelete !== null) {
        fetch(`http://localhost:3000/delete-item/${QIndexDelete}`, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.message);

                loadQuestions()
                closeDeleteModal()
            })
            .catch(err => console.error("削除失敗：", err))
    }
}

deleteNo.onclick = () => {
    deleteModal.style.display = "none";
}

deleteCloseBtn.onclick = () => {
    deleteModal.style.display = "none";
}

// 検索ボタンを押したとき
searchBtn.onclick = () => {
    const categorySearch = document.getElementById("category-search").value;
    const levelSearch = document.getElementById("level-search").value;

    fetch(`http://localhost:3000/search?category=${categorySearch}&level=${levelSearch}`)
    .then(res => res.json())
    .then(data => {
        renderList(data);
    })
    .catch(err => console.error(err));
}
searchResetBtn.onclick = () => {
    fetch("http://localhost:3000/question_list")
    .then(res => res.json())
    .then(data => renderList(data));
}

// リスト表示の更新
function renderList(data) {
    qList.innerHTML = "";

    data.forEach((question) => {
        const li = document.createElement("li");
        li.innerHTML = ` 
            <span class="category-tag">${question.category}</span>
            <span class="level-tag">${question.level}</span>
            <strong class="q-text">${question.text}</strong>
            
            <button class="edit-btn" onclick="openEditModal(${question.id})">編集</button>
            <button class="delete-btn" onclick="deleteQuestion(${question.id})">削除</button>
            <button class="decide-btn" onclick="toDecide(${question.id})">決定</button>
        `
        qList.appendChild(li);
    });
}

// フォームのリセット
function resetForm() {
    document.getElementById("q-text").value = "";
    document.getElementById("category-new").selectedIndex = "";
    document.getElementById("level-new").selectedIndex = 0;
}

// 編集ポップアップ→編集事項入力してもらう
function openEditModal(id) {
    currentEditID = id;
    fetch(`http://localhost:3000/update-text/${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('text-edit').value = data.text;
            document.getElementById("answer-edit").value = data.answer;
            document.getElementById('category-edit').value = data.category;
            document.getElementById('level-edit').value = data.level;

            editModal.style.display = "block";
        });
}

function deleteQuestion(id){
    QIndexDelete = id;
    deleteModal.style.display = "block";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
    QIndexDelete = null;
}

// 決定ボタン押したら画面遷移
function toDecide(id) {
    window.location.href = `../speech_reco/speech_reco.html?id=${id}`
}

function loadQuestions(){
    fetch('http://localhost:3000/question_list')
        .then(res => res.json())
        .then(data => {
            console.log("MySQLから届いたデータ:", data);
            renderList(data);
        })
    .catch(err => console.error("通信エラー:", err));
}

// ページ読み込み時に実行
window.onload = loadQuestions;