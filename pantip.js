const puppeteer = require('puppeteer')
const config = require('./pantip.config.js')
const { write, append } = require('./filemanage')
const fs = require('fs')
const url = config.url

puppeteer.launch().then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(url)

  console.log(`Find topic at "${url}" ...`)
  await autoScroll(page)

  let links = await page.evaluate(() => {
    let As = document.querySelectorAll('.post-list-wrapper > .post-item')
    let data = []
    for (let i of As) {
      let childs = i.children
      let link = childs[1].children[0]
      let time = i.children[2].children[1].children[0].getAttribute(
        'data-utime',
      )
      data.push([
        link.textContent.replace(/[,"(\s)(\n)]/g, ''),
        link.href,
        time,
      ])
    }
    return data
  })

  links = [links[0], links[1]]

  console.log('Finding topic was finish !\n')
  const social = 'pantip'
  await write('{\n', social)
  let result = ''
  let index = 1
  for (let [topic, i, time] of links) {
    console.log(`Get data from "${i}".`)
    result = `  "${topic}" : {\n  "comments" : [\n`
    result += await getComment(page, i)
    result += `  ],\n  "date" : "${time}"\n }`
    if (time != links[links.length - 1][2]) result += ',\n'
    else result += '\n'
    await append(result, social)
    console.log(`Data from "${i}" was save!. (${index}/${links.length}) \n`)
    index++
  }
  await append('}', social)

  console.log('Get data finish!')

  await browser.close()
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

async function getComment(page, des) {
  await page.goto(des)
  await autoScroll(page)
  let texts = await page.evaluate(() => {
    let data = ''
    let elements = document.querySelectorAll(
      '.display-post-story-wrapper > .display-post-story',
    )
    for (var element of elements)
      data += `    "${element.textContent.replace(/[,"(\s)(\n)(\t)]/g, '')}"${
        element != elements[elements.length - 1] ? ',\n' : '\n'
      }`
    return data
  })
  return texts
}
