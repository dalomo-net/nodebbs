const express = require('express')
const app = express()
const port = 8850

const fs = require('fs');

var helmet = require('helmet')
app.use(helmet())

app.use('/nodebbs', express.static('public'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.route('/nodebbs/msg')
  .post((req, res) => {
    if (req.body['user_message'] === '') {
      res.status(400).send('ないようがないよう')
      return;
    }

    if (req.body['user_message'].length > 400) {
      res.status(400).send('ないようがながいよう')
      return;
    }

    if (req.body['user_name'].length > 20) {
      res.status(400).send('なまえがながいよう')
      return;
    }

    var obj = {
      id: Date.now(),
      contents: {
        name: escapeHtml(req.body['user_name']),
        msg: escapeHtml(req.body['user_message']),
        dt: fmtdate()
      }
    }

    var stats = fs.statSync('log.json');
    var fileSizeInBytes = stats.size;

    if (!fileSizeInBytes) {
      var str = JSON.stringify(obj)
    } else {
      var str = ',' + JSON.stringify(obj)
    }

    fs.appendFileSync('log.json', str, 'utf8')
    res.redirect('/nodebbs')

  })

  .get((req, res) => {
    const obj = JSON.parse('[' + fs.readFileSync('log.json', 'utf8') + ']')
    res.json(obj)
  })

app.delete('/nodebbs/msg/:id', (req, res) => {
  const id = req.params.id
  const obj = JSON.parse('[' + fs.readFileSync('log.json', 'utf8') + ']')
  const newObj = obj.filter(item => item.id != id)
  fs.writeFileSync('log.json', JSON.stringify(newObj).slice(1).slice(0, -1), 'utf8')
  res.end()

})

app.put('/nodebbs/msg/:id', (req, res) => {
  const id = req.params.id
  const obj = JSON.parse('[' + fs.readFileSync('log.json', 'utf8') + ']')
  const newObj = obj.map(item => {
    if (item.id == id) {
      item.contents.msg = escapeHtml(req.body['msg']);
      item.contents.dt = fmtdate();
    }
    return item
  })
  fs.writeFileSync('log.json', JSON.stringify(newObj).slice(1).slice(0, -1), 'utf8')
  res.end()
})

app.listen(port, () => {
  console.log('app start ^^')
})

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtdate() {
  let o = new Intl.DateTimeFormat('jp-JP', {
    weekday: 'narrow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })

  return o.format(new Date())
}