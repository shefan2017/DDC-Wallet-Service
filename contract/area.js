let bignum = require('bignumber')
let Config = require("../csv/constain")
let Config2 = require("../csv/config")
module.exports = {
    /**
     * 创建区域
     * @param {String} name 区域名
     * @param {String} lng 经纬度集合 以|分割和，分割
     * @param {String} address 地址 附近的地址
     */
    addArea: async function (name, lng, address) {
        //app.validate("string",name,{length:{minimum: 3, maximum: 64}});
        //app.validate("string",address,{length:{minimum: 3, maximum: 120}})
        let lngs = lng.split("|");
        //app.validate("array",lngs,{length:{minimum: 2, maximum: 4}})

        let exits = await app.model.Area.exists({ name: name });

        if (exits) {
            return "该名称已存在"
        }
        let id = app.autoID.increment("area_max_id")
        app.sdb.create("area", {
            id: id,
            name: name,
            lng: lng,
            timestamp: this.trs.timestamp,
            address: address,
            authorId: this.trs.senderId
        });
        app.sdb.create("Log", {
            id: app.autoID.increment("log_max_id"),
            code: Config.code.CreateArea,//创建区域
            amount: "0.1",
            precesion: "创建区域",
            timestamp: this.trs.timestamp,
            authorId: this.trs.senderId,
            LandName: name,
            currency:Config2.cy
        })//日志
    },
    //添加地块
    addLand: async function (name, lng, address, name2, begin, end, amount) {
        //app.validate("string",name,{length:{minimum: 3, maximum: 64}});
        //app.validate("string",address,{length:{minimum: 15, maximum: 120}})
        //let lngs=lng.split("|");
        //app.validate("array",lngs,{length:{minimum: 2, maximum: 4}})
        
        let landexits = await app.model.Land.exists({ name: name });
        if (landexits) {
            return "该名称已存在"
        }
        let areaexits = await app.model.Area.findOne({ condition: { name: name2 } });
        if (!areaexits) {
            return "该区域不存在"
        }
        let id = app.autoID.increment("land_max_id")
        let auctionId=app.autoID.increment("auction_max_id")
        let currency=Config2.cy;
        console.log(" \n",id,auctionId)
        //创建地块
        app.sdb.create("Land", {
            id: id,
            name: name,
            lng: lng,
            areaId: areaexits.id,
            timestamp: this.trs.timestamp,
            address: address,
            authorId: this.trs.senderId,
            status: Config.status.Aucting,//拍卖中
            auctionId:auctionId//拍卖id
        });
        console.log("\n","创建地块")
        //创建拍卖
        app.sdb.create("Auction", {
            id:auctionId,
            landId: id,
            landName: name,
            MaxAmount: 0,//最大值
            MaxAuthorId: "",//最大值人
            status: Config.status.Aucting,//拍卖中
            begin_time: begin,//开始时间
            end_time: end,//结束时间
            amount: amount,//金额
            currency: currency,//使用资产
            status:Config.status.Aucting//状态
        })
        console.log("\n","创建拍卖")

        //创建日志
        app.sdb.create("Log", {
            id: app.autoID.increment("log_max_id"),
            code: Config.code.CreateLand,//创建地块事件
            amount: "0.1",//金额
            precesion: "创建地块",//描述
            timestamp: this.trs.timestamp,//时间
            authorId: this.trs.senderId,//发起人
            LandName: name,//地块名
            currency:currency//资产
        })//日志
        console.log("\n","创建日志")
        //
    },
    //参与拍卖
    addToAuction: async function (auctionId, amount) {
        //查询是否有该拍卖
        let Auction = await app.model.Auction.findOne({ condition: { id: auctionId } })
        if (!Auction) {
            return "该拍卖不存在"
        }
        /**    需要修改     **/
        let currency = Config2.cy;//资产
        //查询地块
        let Land = await app.model.Land.findOne({ condition: { id: Auction.landId } });
        if (!Land) return "没有该地块"
        //查询余额
        let balance = app.balance.get(this.trs.senderId, currency);
        if (balance.lt(margin)) return '余额不足'//余额不足
        //验证时间
        let time = Auction.timestamp_end;
        let now_time = this.trs.timestamp;
        if (time < now_time) return "该地块拍卖已结束"
        let Land_begin = Auction.timestamp_begin;
        if (Land_begin > now_time) return "该地块拍卖还为开始"
        //所有的参与该拍卖的信息
        let totalAuction = await app.model.Auctionlog.findAll({ condition: { auctionId: auctionId } });//总数
        if (!totalAuction || totalAuction.length == 0) {//在第一次出价的情况下
            if (amount <= Auction.amount) {
                return "出价必须大于起拍价"
            }
        }
        //查询参与人的详情
        let Auctions = await app.model.Auctionlog.findAll({ condition: { auctionId: auctionId, authorId: this.trs.senderId } });
        let total = 0;//参与人总金额
        if (Auctions) {//如果已存在
            Auctions.forEach(function (item) {
                total += item.amount;
            })
        }
        console.log("=========== Find a Auction ", total);
        if (total + amount > Auction.MaxAmount) {//如果大于最大金额
            //添加参与人记录
            app.sdb.create('Auctionlog', {
                id: app.autoID.increment("auctionlog_max_id"),
                timestamp: this.trs.timestamp,
                amount: amount,
                authorId: this.trs.senderId,
                auctionId: Auction.id,
                sendStatus:"",
                sendTime:""

            });
            //创建日志记录
            app.sdb.create("Log", {
                id: app.autoID.increment("log_max_id"),
                code: Config.code.JoinAuction,//参与拍卖
                amount: amount,
                precesion: "参与拍卖",
                timestamp: this.trs.timestamp,
                authorId: this.trs.senderId,
                LandName: Land.name
            })//日志
            //更新记录
            app.sdb.update('Land', { Max_Amount: total, Max_Address: this.trs.senderId }, { id: Land.id })
            //减少余额 
            app.balances.decrease(this.trs.senderId, currency, amount*1e8)

        }
        return "你的出价必须大于最高出价";
    },
    //拍卖结束
    AuctionEnd: async function (auctionId) {
        //寻早拍卖
        let Auction = await app.model.Auction.findOne({ condition: { id: auctionId } });
        if (!Auction) {
            return "没有拍卖信息"
        }
        //寻找拍卖
        let Land=await app.model.Land.findOne({condition:{id:Auction.landId}})
        if(!Land){
            return "没有该地块信息"
        }
        //验证时间
        let time = Auction.timestamp_end;
        let now_time = this.trs.timestamp;
        if (time >= now_time) return "该地块拍卖还未结束";
        //寻找参与人记录
        let AllAmount = await app.model.Auctionlog.findAll({ condition: { auctionId: auctionId } })
        if (Auction.MaxAmount == 0 || Auction.MaxAuthorId == "" || !AllAmount || AllAmount.length == 0) {
            return "没有任何人参与该拍卖"
        }
        //获取最大值人的拍卖记录
        let Max_Addresses = AllAmount.filter(function (item) {
            return item.authorId == Auction.MaxAuthorId;
        });//地块所有人的拍卖详情
        let currency = Config2.cy;
        let OwnerAddress =  Auction.MaxAuthorId;
        if (Max_Addresses.length == AllAmount.length) {//没有其他人参与拍卖
        } else {
            let otherAddress = AllAmount.filter(function (item) {
                return item.authorId != OwnerAddress;
            });//筛选其他人的拍卖记录
            var tmp = {}//tmp[address]=amount;
            otherAddress.forEach(function (item) {
                if (tmp[item.authorId]) {
                    tmp[item.authorId] += item.amount;
                } else {
                    tmp[item.authorId] = item.amount;
                }
            });
            for (let item in tmp) {
                /** 需要添加更新记录 */
                app.balances.increase(item, Auction.currency, tmp[item]*1e8)//退回余额
                app.sdb.create("Log", {
                    id: app.autoID.increment("log_max_id"),
                    code: Config.code.AuctionEnd_NotGet,//未拍卖到地块
                    amount: tmp[item],
                    precesion: "未拍卖到地块,金额退回",
                    timestamp: this.trs.timestamp,
                    authorId: item,
                    LandName: Land.name,
                    currency:Auction.currency
                })//日志
            }
        }
        let total = 0;//拍卖最大值
        Max_Addresses.forEach(function (item) {
            total += item.amount;
        });
        app.model.update("land",{
            authorId:OwnerAddress,
            status:Config.status.Aucted
        },{
            id:Land.id
        })//修改地块
        app.model.update("Auction", {
            status:Config.status.Aucted
        }, {
                id: auctionId
            })
        app.sdb.create("Log", {
            id: app.autoID.increment("log_max_id"),
            code: Config.code.AuctionEnd_getLand,//拍卖到地块
            amount: amount,
            precesion: "拍卖到地块，扣除金额",
            timestamp: this.trs.timestamp,
            authorId: this.trs.senderId,
            LandName: Land.name,
            currency:Auction.currency
        })//日志

    }
}