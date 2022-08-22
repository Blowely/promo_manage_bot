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

module.exports.checkCorrectTime = checkCorrectTime;
module.exports.checkValidTime = checkValidTime;
module.exports.viewValidTime = viewValidTime;
module.exports.partFreeHandler = partFreeHandler;