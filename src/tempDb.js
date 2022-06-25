const DATABASE = {
    uuidUser: {
        '92huf9-sdkfj-23dj23jd-ewdi-0328fh4': {
            name: 'Магические ручки',
            id: '92huf9-sdkfj-23dj23jd-ewdi-0328fh4',
            freeTime: {
                morning: {
                    name: "",
                    phone: "",
                    email: "",
                    isPaid: false,
                    payment: {
                        method: '',
                        date: ''
                    }
                },
                day: {
                    name: "",
                    phone: "",
                    email: "",
                    isPaid: false,
                    payment: {
                        method: '',
                        date: ''
                    }
                },
                morning: {
                    name: "",
                    phone: "",
                    email: "",
                    isPaid: false,
                    payment: {
                        method: '',
                        date: ''
                    }
                },
            },
            occupiedTime: {
                1400: {
                    name: "Bogdan Durmanchaev",
                    phone: "+79203240232",
                    email: "bogdan@google.com",
                    isPaid: false,
                    payment: {
                        method: 'QIWI',
                        date: '1231213321' || '2022-05-23'
                    }
                },
                1600: {
                    name: "Maks Zolin",
                    phone: "+79204565656",
                    email: "maks@google.com",
                    isPaid: true,
                    payment: {
                        method: 'QIWI',
                        date: '1231213321' || '2022-05-23'
                    }
                },
                1700: {
                    name: "Maks Zolin",
                    phone: "+79204565656",
                    email: "maks@google.com",
                    isPaid: true,
                    payment: {
                        method: 'QIWI',
                        date: '1231213321' || '2022-05-23'
                    }
                }
            }
        },
        '934r4f-fwefew-23e23-wefwef-fergreg': {
            name: 'Мой автомобиль',
            id: '934r4f-fwefew-23e23-wefwef-fergreg',
            freeTimePlaces: {
                '1200': '12:00',
                '1300': '13:00',
                '1500': '15:00',
            }
        }
    }
}

module.exports.DATABASE = DATABASE;