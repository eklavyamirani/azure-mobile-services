function insert(item, user, request) {
    var method = item.method;
    if (!method) {
        request.respond(400, { error: 'request must have a \'method\' member' });
        return;
    }

    var channelUri = item.channelUri;
    var usingNH = item.usingNH;
    var nhNotificationType = item.nhNotificationType;
    if (!usingNH) {
        if (!channelUri) {
            request.respond(400, { error: 'request must have a \'channelUri\' member' });
            return;
        }
    }

    var payload = item.payload;
    if (!payload) {
        request.respond(400, { error: 'request must have a \'payload\' member' });
        return;
    }

    if (!item.xmlPayload) {
        request.respond(400, { error: 'request must have a \'xml payload\' member' });
        return;
    }
    var nhPayload = '<?xml version="1.0" encoding="utf-8"?>' + item.xmlPayload;
    if (nhNotificationType == 'raw') {
        nhPayload = payload;
    }

    var successFunction = function (pushResponse) {
        console.log('WNS push sent: ', pushResponse);
        request.respond(201, { id: 1, response: pushResponse });
    };

    var errorFunction = function (pushError) {
        console.log('Error in WNS push: ', pushError);
        request.respond(500, { error: pushError });
    }

    var options = {
        success: successFunction,
        error: errorFunction
    };

    if (usingNH) {
		if(nhNotificationType=='template')
		{
			var templateNotification = {
			"News_English": "World News in English!",
			"News_French": "World News in French!",
			"News_Mandarin": "World News in Mandarin!",
			"News_Badge": "10"
			}
			push.send('World',templateNotification,options);
		}
		else
		{
			var wnsType = 'wns/' + nhNotificationType;
			push.wns.send("tag1",
			nhPayload,
			wnsType, options);
		}
    }
    else {
        var wnsFunction = push.wns[method];
        if (wnsFunction) {
            wnsFunction(channelUri, payload, options);
        } else {
            request.respond(400, { error: 'method not supported: ' + method });
        }
    }
}