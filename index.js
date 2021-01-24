const cropEnable = document.getElementById('crop-enable')
const cropW = document.getElementById('crop-w')
const cropH = document.getElementById('crop-h')
const cropX = document.getElementById('crop-x')
const cropY = document.getElementById('crop-y')
const uploader = document.getElementById('uploader')
const video = document.getElementById('video')
const log = document.getElementById('log')

const {
    createFFmpeg, fetchFile
} = FFmpeg
const ffmpeg = createFFmpeg({
    log: true,
    logger: ({
        message
    }) => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const hour = now.getHours()
        const minute = now.getMinutes()
        const second = now.getSeconds()
        const millisecond = now.getMilliseconds()
        const nowText = ('0000' + year).slice(-4) + '/' +
            ('00' + month).slice(-2) + '/' +
            ('00' + day).slice(-2) + ' ' +
            ('00' + hour).slice(-2) + ':' +
            ('00' + minute).slice(-2) + ':' +
            ('00' + second).slice(-2) + '.' +
            ('000' + millisecond).slice(-3)
        log.value += '[' + nowText + '] ' + message + '\n'
        log.scrollTop = log.scrollHeight
    }
})

const transcode = async ({
    target: {
        files
    }
}) => {
    await ffmpeg.load()
    const reader = new FileReader()
    reader.onload = async function () {
        const inputName = 'input-' + files[0].name
        const outputName = 'output-' + files[0].name
        ffmpeg.FS('writeFile', inputName, new Uint8Array(reader.result))

        let option = []
        option.push('-i')
        option.push(inputName)
        if (cropEnable.checked) {
            const w = cropW.value
            const h = cropH.value
            const x = cropX.value
            const y = cropY.value
            if (w && h) {
                option.push('-vf')
                let crop = 'crop=' + w + ':' + h
                if (x && y) {
                    crop += ':' + x + ':' + y
                }
                option.push(crop)
            }
        }
        option.push(outputName)
        await ffmpeg.run(...option)

        const data = ffmpeg.FS('readFile', outputName)
        ffmpeg.FS('unlink', inputName)
        ffmpeg.FS('unlink', outputName)

        video.src = URL.createObjectURL(new Blob([data.buffer], {
            type: 'video/mp4'
        }))
    }
    reader.readAsArrayBuffer(files[0])
}
uploader.addEventListener('change', transcode)
