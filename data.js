// 菜品指南库 (注：热量为每100克的大卡数，仅供参考)
const GUIDE_DATA = {
    "番茄": {
        aliases: ["西红柿"],
        category: "茄果",
        pick: ["摸起来微软，果肩带青", "切开起沙、汁水足", "通体通红还硬邦邦的慎选"],
        units: ["斤", "个"],
        refWeight: "1个≈200g",
        pair: ["鸡蛋", "牛腩", "豆腐"],
        caution: "生拌黄瓜时维C利用率略低，熟食影响很小",
        calories: 20
    },
    "土豆": {
        aliases: ["马铃薯", "洋芋"],
        category: "根茎",
        pick: ["圆溜沉实", "表皮发绿、发芽的绝对不要买"],
        units: ["斤"],
        refWeight: "1个中等≈150g",
        pair: ["牛腩", "青椒", "醋"],
        caution: "发芽或变绿会产生龙葵素，有毒不能吃",
        calories: 81
    },
    "牛腩": {
        aliases: ["牛肉"],
        category: "肉类",
        pick: ["肉质有光泽", "脂肪洁白或淡黄", "摸起来微干不粘手"],
        units: ["斤", "克"],
        refWeight: "",
        pair: ["番茄", "土豆", "白萝卜"],
        caution: "炖煮前先焯水去血沫",
        calories: 332
    },
    "菠菜": {
        aliases: [],
        category: "叶菜",
        pick: ["叶子翠绿不发黄", "根部呈现鲜艳的红色"],
        units: ["斤", "把"],
        refWeight: "1把≈300g",
        pair: ["鸡蛋", "猪肝", "粉丝"],
        caution: "草酸较多，吃之前建议先焯水",
        calories: 24
    },
    "芹菜": {
        aliases: ["香芹", "本芹", "西芹"],
        category: "叶菜",
        pick: ["茎秆紧实脆嫩", "叶片翠绿不发黄", "无空心、筋不老"],
        units: ["斤", "把"],
        refWeight: "1把≈250g（约40大卡/把）",
        pair: ["炒香干", "炒牛肉", "凉拌", "榨汁"],
        caution: "膳食纤维丰富；血压人群适合吃，但不能替代降压药",
        calories: 16,
        sellChannel: "supermarket_common"
    }
};

// 单位换算比例 (以克为基准)
const UNIT_RATES = {
    "千克": 1000, 
    "公斤": 1000,
    "斤": 500, 
    "两": 50, 
    "克": 1
};
