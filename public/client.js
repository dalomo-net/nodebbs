function contents(data) {
    data.reverse();
    let s = ''
    for (let row of data) {
        s += `
        <p id="${row['id']}">${row['contents']['msg']}</p>
        <p><button type="button" id="edit-${row['id']}" name="editbtn">編集</button>
            名前: ${row['contents']['name']} 日時: ${row['contents']['dt']}
            <button type="button" id="del-${row['id']}" name="delbtn">削除</button></p>
        <hr>
        `
    }

    var contents = document.getElementById('contents')
    contents.innerHTML = s
}

function onClickdelbtn() {
    let id = this.id.slice(4)
    fetch('https://dalomo.net/nodebbs/msg/' + id, {
        method: 'DELETE'
    })
        .then(res => location.reload())
}

function onClickeditbtn() {
    let id = this.id.slice(5)
    let p = document.getElementById(id)
    let msg = p.innerText
    let textarea = document.createElement('textarea')
    textarea.value = msg
    textarea.id = id
    p.replaceWith(textarea)

    let btn = document.getElementById('edit-' + id)
    btn.innerText = '更新'
    btn.name = 'udbtn'
    btn.removeEventListener('click', onClickeditbtn)
    btn.addEventListener('click', onClickupdate)
}

function onClickupdate() {
    let id = this.id.slice(5)
    let textarea = document.getElementById(id)
    let msg = textarea.value
    let data = {
        'msg': msg
    }
    fetch('https://dalomo.net/nodebbs/msg/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            let p = document.createElement('p')
            p.id = id
            p.innerText = msg
            textarea.replaceWith(p)

            let btn = document.getElementById('edit-' + id)
            btn.innerText = '編集'
            btn.name = 'editbtn'

            let editbtn = document.getElementsByName('editbtn')

            for (const eb of editbtn) {
                eb.removeEventListener('click', onClickeditbtn)
                eb.addEventListener('click', onClickeditbtn)
            }
        })
}

fetch('https://dalomo.net/nodebbs/msg')
    .then(res => res.json())
    .then(data => contents(data))
    .then(e => {
        let editbtn = document.getElementsByName('editbtn')
        let delbtn = document.getElementsByName('delbtn')

        for (const eb of editbtn) {
            eb.addEventListener('click', onClickeditbtn)
        }

        for (const db of delbtn) {
            db.addEventListener('click', onClickdelbtn)
        }

    })
