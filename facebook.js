const puppeteer = require('puppeteer')
const config = require('./facebook.config.js')
const url = config.url

puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(url)
  await autoScroll(page)

  let links = await page.evaluate(() => {
    let As = document.querySelectorAll('._gll > _ajw > _52eh _5bcu > a')
    let data = []
    for (let i of As) {
      data.push([i.textContent.replace(/[," (\n)]/g, ''), i.href])
    }
    return data
  })

  console.log(links)

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
