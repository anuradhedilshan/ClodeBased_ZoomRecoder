module.exports = () => {
    class ScreenCaster {
        constructor() {
            this.canvas = document.createElement('canvas');

            document.body.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.chunks = [];
        }

        async beginRecording(stream) {
            return new Promise((resolve, reject) => {
                // @ts-ignore No MediaRecorder
                this.recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
                this.recorder.onerror = reject;
                this.recorder.onstop = resolve;
                this.recorder.start();
            });
        }

        async download() {
            // Download the final webm file
        }

        async start(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
            // @ts-ignore No captureStream API
            this.recordingFinish = this.beginRecording(this.canvas.captureStream());
        }

        async draw(pngData) {
            const data = await fetch(`data:image/png;base64,${pngData}`)
                .then(res => res.blob())
                .then(blob => createImageBitmap(blob));

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(data, 0, 0);

            return this;
        }

        stop() {
            this.recorder.stop();
            this.download();
            return this;
        }

    }
    return new ScreenCaster();
}