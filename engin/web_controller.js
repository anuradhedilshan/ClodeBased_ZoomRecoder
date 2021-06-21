const logger = require('./logger');




async function check_in_waiting_room(page) {
    try {
        var a = await page.waitForSelector('.wr-tile', { timeout: 60000 }).then(
            async () => {
                console.log("ELELEMT GOTED");
                const searchValue = await page.$eval('div.wr-tile', (el) => true);
                console.log(searchValue);
                return searchValue;
            });
        return a;
    } catch (e) {
        return false;
    }
}


async function check_in_meeting(page) {
    try {
        var a = await page.waitForSelector('.footer-button__participants-icon',{ timeout: 300000 }).then(
            async () => {
                console.log("ELELEMT GOTED  BY FUCK ");
                const searchValue = await page.$eval('.footer-button__participants-icon', (el) => true);
                console.log("FOR", searchValue);
                return searchValue;
            });
        console.log('A IS', a);
        return a;
    } catch (e) {
        console.log("Error IN FUCK", e);
        return false;
    }

}


async function join_over_voip(page) {
    try {
        var a = await page.waitForSelector('.join-audio-by-voip', { timeout: 30000 }).then(
            async () => {
                console.log("ELELEMT GOTED IN JoinOver");
                const Value = await page.$eval('.join-audio-by-voip__join-btn', (el) => {
                    console.log(el, "ELELEEMMEME");
                    setTimeout(() => {
                        console.log("CKICkd", el);
                        el.click();

                    }, 10000)
                    return true;
                });


                // console.log('AFTER GOT BUTTON');
                // await page.click('button.join-audio-by-voip__join-btn');
                // console.log('AFTER ! GOT BUTTON');
                page.click('button.join-audio-by-voip__join-btn', { delay: 2000 })
                // console.log('AFTER 2 GOT BUTTON');
                return a;
            });
        return a;
    } catch (e) {
        return false;
    }
}


module.exports.setupAudio = async function (page) {
console.log("SET AUDRIO");
    if (await check_in_waiting_room(page)) {
        await timeout(10000);
        if (await check_in_meeting(page)) {
            await join_over_voip(page);
            return true;
        } else {
            return false;
        }

    } else {
        if (await check_in_meeting(page)) {
            await join_over_voip(page);
            return true;
        } else {
            return false;
        }
    }

}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
