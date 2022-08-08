const availableKeyCodes = ['KeyZ', 'KeyX', 'KeyC']
const marks = ['Z', 'X', 'C']
const keyMarkAliases = availableKeyCodes.reduce((aliases, value, i) => (aliases[value] = marks[i], aliases), {})
const gameTimerInterval = 10

var appBody = null
var video = null
var playTimer = null

var scoreText = null
var score = 0
var healthText = null
var health = 1000

var cross = null
var crossLimits = []
var crossline = null
var spawnMarksInterval = 50
var moveMarksSpeed = 2
var spawnMarksDelay = { current: 0, step: gameTimerInterval * spawnMarksInterval}
var moveMarksDelay = { current: 0, step: gameTimerInterval}
var danceDuration = spawnMarksDelay.step * 1.1
var createdMarks = []

var paused = false

window.addEventListener('load', renderScene)
window.addEventListener('resize', calculateCross)
document.addEventListener('visibilitychange', pause)
document.addEventListener('keydown', (key) => keydown(key.code))

function renderScene() {
    appBody = document.getElementById('app')
    video = document.getElementById('catVideo')
    scoreText = document.getElementById('score_numbers')
    healthText = document.getElementById('health_numbers')
    cross = document.getElementById('cross')
    crossline = document.getElementById('crossline')

    calculateCross()
    start()
}

function keydown(key) {
    switch (key) {
        case 'ArrowUp':
            modifySpeed(-gameTimerInterval)
            break
        case 'ArrowDown':
            modifySpeed(gameTimerInterval)
            break
        case 'Space':
            paused = !paused
            break
        default:
            if (availableKeyCodes.includes(key)) { checkHit(keyMarkAliases[key]) }
            break
    }
}

function gameTimerHandler() {
    spawnMarksDelay.current += gameTimerInterval
    moveMarksDelay.current += gameTimerInterval

    if (spawnMarksDelay.current >= spawnMarksDelay.step) {
        spawnRandomMark()
        spawnMarksDelay.current = 0

        removeMark()
    }

    if (moveMarksDelay.current >= moveMarksDelay.step) {
        moveMarks()
        moveMarksDelay.current = 0
    }
}

function start() {
    window.setInterval(() => paused ? '' : gameTimerHandler(), gameTimerInterval)
}

function createMark(symbol) {
    let mark = Object.assign(document.createElement('span'), {innerText: symbol, style: 'left: -50px;'})

    createdMarks.push(mark)

    return mark
}

function spawnRandomMark() {
    crossline.appendChild(createMark(marks[Math.round(Math.random() * 2)]))
}

function moveMarks() {
    createdMarks.forEach((span) => span.style.left = parseInt(span.style.left) + moveMarksSpeed + 'px')
}

function modifySpeed(step) {
    if (
        (step < 0 && spawnMarksDelay.step >= 20 * gameTimerInterval)
        || (step > 0 && spawnMarksDelay.step <= 200 * gameTimerInterval)
    ) {
        spawnMarksDelay.step += step * 10
        danceDuration = spawnMarksDelay.step * 1.1
    }
}

function calculateCross() {
    crossLimits = [ cross.offsetLeft, cross.offsetLeft + cross.offsetWidth ]
}

function pause() {
    paused = document.visibilityState === 'hidden';
}

function checkHit(key) {
    if (!paused) {
        let span = getMarkInCross()

        if (span) {
            if (span.innerText === key) {
                span.className = 'hit'
                addScore()

                window.clearTimeout(playTimer)
                video.play()
                playTimer = window.setTimeout(() => video.pause(), danceDuration)

                return true
            } else {
                span.className = 'miss'
            }
        }

        getDamage()
    }

    return false
}

function getMarkInCross() {
    return createdMarks.find(span =>
        span.offsetLeft + span.offsetWidth / 2 >= crossLimits[0]
        && span.offsetLeft + span.offsetWidth / 2 <= crossLimits[1]
    )
}

function removeMark() {
    if (createdMarks.find(span => parseInt(span.style.left) >= window.innerWidth)) {
        createdMarks.shift().remove()
    }
}

function addScore() {

    if (health > 0) {
        score++
        scoreText.innerText = score
    } else {
        scoreText.innerText += '-7'
    }
}

function getDamage() {
    if (health > 0) {
        health -= 7

        if (health === -1) {
            health = 0
            healthText.innerText = "1000-7"
        } else {
            healthText.innerText = health
        }
    } else {
        healthText.innerText += "-7"
    }
}