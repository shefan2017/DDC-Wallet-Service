/**
 * 拍卖记录
 */
console.log("==============auctionslogs===")
module.exports={
    name:"auctionlogs",
    fields:[
        {
            name:"id",
            type:"String",
            length:"20",
            not_null:true,
            primart_key:true
        },{
            name:"timestamp",
            type:"Number",
            length:"20",
            not_null:"true"
        },{
            name:"amount",
            type:"Number",
            length:"20",
            not_null:true
        },{
            name: 'authorId',
            type: 'String',
            length: 50,
            not_null: true
        },{
            name:"auctionId",
            type:"String",
            length:"20",
            not_null:true,
        },{
            name:"sendStatus",//状态是否发送
            type:"String",
            length:2,
            not_null:false,
        },{
            name:"sendTime",//发送时间
            type:"String",
            length:20,

        }
    ]
}