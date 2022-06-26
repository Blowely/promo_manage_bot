const DATABASE = {
    uuidUser: {
        '92huf9-sdkfj-23dj23jd-ewdi-0328fh4': {
            name: 'Магические ручки',
            id: '92huf9-sdkfj-23dj23jd-ewdi-0328fh4',
            places: {
                today: {
                    morning: {
                        name: "Bogdan Durmanchaev",
                        phone: "+79203240232",
                        email: "bogdan@google.com",
                        is_occupied: true,
                        promo_time: '08:00',
                        isPaid: false,
                        payment: {
                            method: 'QIWI',
                            date: '1231213321' || '2022-05-23'
                        }
                    },
                    day: {
                        name: "",
                        phone: "",
                        email: "",
                        is_occupied: false,
                        promo_time: '',
                        isPaid: false,
                        payment: {
                            method: '',
                            date: ''
                        }
                    },
                    evening: {
                        name: "Maks Zolin",
                        phone: "+79204565656",
                        email: "maks@google.com",
                        is_occupied: true,
                        promo_time: '18:00',
                        isPaid: true,
                        payment: {
                            method: 'QIWI',
                            date: '1231213321' || '2022-05-23'
                        }
                    }
                },
                tomorrow: {
                    morning: {
                        name: "",
                        phone: "",
                        email: "",
                        is_occupied: false,
                        promo_time: '',
                        isPaid: false,
                        payment: {
                            method: '',
                            date: ''
                        }
                    },
                    day: {
                        name: "Maks Zolin",
                        phone: "+79204565656",
                        email: "maks@google.com",
                        is_occupied: true,
                        promo_time: '14:00',
                        isPaid: true,
                        payment: {
                            method: 'QIWI',
                            date: '1231213321' || '2022-05-23'
                        }
                    },
                    evening: {
                        name: "",
                        phone: "",
                        email: "",
                        is_occupied: false,
                        promo_time: '',
                        isPaid: false,
                        payment: {
                            method: '',
                            date: ''
                        }
                    }
                },
                next_tomorrow: {
                    morning: {
                        name: "",
                        phone: "",
                        email: "",
                        is_occupied: false,
                        promo_time: '',
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
                        is_occupied: false,
                        promo_time: '',
                        isPaid: false,
                        payment: {
                            method: '',
                            date: ''
                        }
                    },
                    evening: {
                        name: "",
                        phone: "",
                        email: "",
                        is_occupied: false,
                        promo_time: '',
                        isPaid: false,
                        payment: {
                            method: '',
                            date: ''
                        }
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