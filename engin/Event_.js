const logger = require('./logger');

class Event {
    max = 2;
    chromelauncherror(msg) {
        logger.error(msg);
    }

    url_luancherror(msg) {
        logger.error(msg);
    }

    cantOpenNewPage(msg) {
        logger.error(msg);
    }
    fmpegStreamError(msg) {
        logger.error(msg);
    }
    ffmpegRecodeError(msg) {
        logger.error(msg);
    }
    installing() {
        logger.log("Instaline");
    }
    installingError(msg) {
        logger.error(msg);
    }
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    find_Large(ar) {
        var large = 0;
        for (let i = 0; i < ar.length; i++) {

            if (large < ar[i]) {
                large = ar[i];

            }
        }
        return large;
    }
    removeA(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }



}

module.exports = Event;