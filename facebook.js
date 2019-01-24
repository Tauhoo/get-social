const puppeteer = require('puppeteer')
const config = require('./facebook.config.js')
const { write, append } = require('./filemanage')
const url = config.url

puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(url)
  console.log(process.env.user)
  await login(page)
  await page.waitForNavigation()
  await page.goto(url)
  await autoScroll(page)

  let links = await page.evaluate(() => {
    let As = document.querySelectorAll('._52eh > a')
    let data = []
    for (let i of As) {
      data.push([i.textContent.replace(/[," (\n)]/g, ''), i.href])
    }
    return data
  })
  links = [links[0], links[1]]
  await write('{\n "events" : {\n', 'facebook')

  for (let [name, link] of links) {
    await page.goto(link)
    let date = await page.evaluate(() => {
      let ele = document.querySelectorAll('._2ycp')[0].getAttribute('content')
      return ele
    })
    let result = `  "${name}" : "${date}"${
      link === links[links.length - 1][1] ? '\n' : ',\n'
    }`
    await append(result, 'facebook')
  }

  await append(' }\n}', 'facebook')

  await page.close()
})

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

async function login(page) {
  let env = process.env
  await page.evaluate(({ user, pass }) => {
    document.getElementById('email').value = user
    document.getElementById('pass').value = pass
    document.querySelector('#loginbutton').click()
  }, env)
}
