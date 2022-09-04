const checkCorrectTime = (str) => {
    try {
        console.log('>>> str =', str);
        const pattern = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        console.log('>>> pattern.test =',pattern.test(str));
        return pattern.test(str);
    } catch (e) {
        console.log('e =', e.message);
    }
}

const checkValidTime = (str, part) => {
    console.log('>>> part =', part);
    const morningPat = /^([7-9]|0[7-9]|1[0-1]|):[0-5][0-9]$/;
    const dayPat = /^(1[2-6]):[0-5][0-9]$/;
    const eveningPat = /^(1[7-9]|2[0-1]):[0-5][0-9]$/;

    switch (part) {
        case 'morning': {
            return morningPat.test(str);
        }
        case 'day': {
            return dayPat.test(str);
        }
        case 'evening': {
            return eveningPat.test(str);
        }
    }
}

const checkValidDate = (str) => {
    console.log('>>> str =', str);
    const regDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

    return regDate.test(str);
}

const formateDate = (date) => {
    try {
        let res = date.replace(/\-/g, '/');
        res = res.replace(/\./g, '/');
        return res;
    } catch (e) {
        console.log('e formateDate =', e.message);
    }

}

const viewValidTime = (part) => {
    switch (part) {
        case 'morning': {
            return '07:00 до 11:59';
        }
        case 'day': {
            return '12:00 до 16:59';
        }
        case 'evening': {
            return '17:00 до 21:59';
        }
    }
}

const partFreeHandler = (data) => {
    switch (data) {
        case 'get_out_morning': return 'morning';
        case 'get_out_day': return 'day';
        case 'get_out_evening': return 'evening';
    }
}

const channelLinkHandler = (link) => {
    const str = link.split('/');
    if (str.length !== 4) return null;

    return str[str.length - 1];
}

const countChannelPlacesHandler = (count) => {
    return (count > 0 && count <= 10);
}

module.exports.checkCorrectTime = checkCorrectTime;
module.exports.checkValidTime = checkValidTime;
module.exports.checkValidDate = checkValidDate;
module.exports.formateDate = formateDate;
module.exports.viewValidTime = viewValidTime;
module.exports.partFreeHandler = partFreeHandler;
module.exports.channelLinkHandler = channelLinkHandler;
module.exports.countChannelPlacesHandler = countChannelPlacesHandler;