const {exec} = require('child-process-async');
const path = require("path");
const logger = require('./logger');

var id = [];
var max_sinkOutputs = 2;
var sync_map = {

}
var freeSinks = null;





var updateSyncMap = exports.updateSyncMap = function (sinkId, inputId) {
    this.sync_map[sinkId] = inputId;

    freeSinks = [];

    for (let i = 0; i < Object.keys(sync_map).length; i++) {
        if (sync_map[Object.keys(sync_map)[i]] == null) {
            freeSinks.push(Object.keys(sync_map)[i])
        }
    }
    return freeSinks;
}

var start = exports.start = async function () {
    try {
        await exec('pulseaudio -D');
    } catch (error) {
        logger.log("Pulse audio failed to start: " + error)
    }
}

var createSink = exports.createSink = async function (sinkName) {
    var sinkId = await readSinkId(sinkName)

    if (sinkId) {
        logger.log("Existing Sink id: " + sinkId)
        return sinkId;
    } else if (getNumofSinks() > 10) {
        logger.log("Cannot Crete one Max Reched");
        return 0;
    }


    await exec('pactl load-module module-null-sink sink_name=' +
        sinkName + ' sink_properties=device.description=' + sinkName);

    sinkId = await readSinkId(sinkName);
    logger.log("New Sink id: " + sinkId);
    return sinkId;

}

var getNumofSinks = exports.getNumofSinks = async function () {
    const { stdout } = await exec(" pactl list sinks |grep  -c 'Sink #' ");
    return parseInt(stdout)
}


var getInput_IDS = exports.getInput_IDS = async function () {
    const { stdout } = await exec(path.join(__dirname, './scripts/get_sink_ids.sh '));
    return stdout.trim().split('\n').map(x => +x);

}
var getSinks_Names = exports.getSinks_Names = async function () {
    const { stdout } = await exec("pactl list sinks |grep 'Name' | sed 's/^.*: //'");
    return stdout.trim().split('\n');
}

var setDefaultSink = exports.setDefaultSink = async function () {
    logger.log("Setting default sink to 'Default'");
    const defaultSink = "Default";
    const defaultSource = defaultSink + ".monitor";
    await createSink(defaultSink);
    await exec('pacmd set-default-sink ' + defaultSink);
    const { stdout } = await exec('pacmd set-default-source ' + defaultSource);
    const setDefaultOutput = stdout.trim();
    return setDefaultOutput;
}

var readSinkId = exports.readSinkId = async function (sinkName) {
    const { stdout } = await exec('pactl list short sinks | grep ' + sinkName + '| cut -f1');
    const sinkId = stdout.trim();
    return sinkId;
}

var getInputId = exports.getInputId = async function (chromePid) {
    const { stdout } = await exec(path.join(__dirname, './scripts/get_input_index.sh ') + chromePid);
    const inputIdList = stdout.trim().split(" ");
    id.push(inputIdList)

    return inputIdList;
}

var moveInput = exports.moveInput = async function (inputId, sinkId) {
    logger.log("Moving Input id: " + inputId + " to Sink id: " + sinkId);
    const { stdout } = await exec('pacmd move-sink-input ' + inputId + ' ' + sinkId);
    const output = stdout.trim();
    return output;
}
