
# 获取 自选 分组
## API
fetch("https://watchlist.finance.sina.com.cn/portfolio/api/openapi.php/PortfolioService.getPyList?callback=jQuery1111032040908642180943_1763105484640&type=cn", {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9",
    "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Chromium\";v=\"142\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "script",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://i.finance.sina.com.cn/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});



## 接口返回数据

直接返回如下数据:
```
/*<script>location.href='//sina.com';</script>*/
jQuery1111032040908642180943_1763105484640({"result":{"status":{"code":0,"msg":"\u83b7\u53d6\u6210\u529f"},"data":[{"pid":"484279","name":"\u5f3a\u52bf","description":"","description_status":"0","pview":"1","fenzu_config_arr":{"big_config":0,"big_status":0,"big_price":0}},{"pid":"484284","name":"Ty","description":"","description_status":"0","pview":"2","fenzu_config_arr":{"big_config":0,"big_status":0,"big_price":0}}]}})
```

但是本来数据如下(获取 PID 和 name 列表, 用于后续使用):
```
{
    "result": {
        "status": {
            "code": 0,
            "msg": "获取成功"
        },
        "data": [
            {
                "pid": "484279",
                "name": "强势",
                "description": "",
                "description_status": "0",
                "pview": "1",
                "fenzu_config_arr": {
                    "big_config": 0,
                    "big_status": 0,
                    "big_price": 0
                }
            },
            {
                "pid": "484284",
                "name": "Ty",
                "description": "",
                "description_status": "0",
                "pview": "2",
                "fenzu_config_arr": {
                    "big_config": 0,
                    "big_status": 0,
                    "big_price": 0
                }
            }
        ]
    }
}
```



# 给指定分组添加 个股


## API 请求
```
fetch("https://watchlist.finance.sina.com.cn/portfolio/api/openapi.php/HoldV2Service.appendSymbol?callback=jQuery1111032040908642180943_1763105484640&scode=sh601360%40cn&source=pc_mzx&pid=484279", {
  "headers": {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9",
    "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Chromium\";v=\"142\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "script",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-site"
  },
  "referrer": "https://i.finance.sina.com.cn/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
```


## 返回如下数据:
```

/*<script>location.href='//sina.com';</script>*/
jQuery1111032040908642180943_1763105484640({"result":{"status":{"code":0,"msg":"\u6dfb\u52a0\u80a1\u7968\u6210\u529f"},"data":[]}})

```

对应的 JSON 数据为:
```
{
    "result": {
        "status": {
            "code": 0,
            "msg": "添加股票成功"
        },
        "data": []
    }
}
```



# 这是输入的个股信息
```

603556.SH
300475.SZ
002718.SZ
688125.SH
301391.SZ
001309.SZ
688498.SH
601138.SH
300308.SZ
000893.SZ
300756.SZ
300684.SZ
600183.SH
002460.SZ
605580.SH
600089.SH
000572.SZ
300329.SZ
605287.SH
002043.SZ
002759.SZ
601012.SH
002128.SZ
002532.SZ
688525.SH
002240.SZ
002928.SZ
002294.SZ
601288.SH
600496.SH
002056.SZ
603217.SH
603026.SH
603301.SH
001301.SZ
603360.SH
000586.SZ
603185.SH
600302.SH
603536.SH
000735.SZ
603686.SH
000807.SZ
000833.SZ
603067.SH
603755.SH
000933.SZ
603010.SH
601677.SH
600288.SH
600029.SH
605155.SH
605196.SH
601061.SH
688472.SH
600885.SH
688599.SH
002768.SZ
002772.SZ
300136.SZ
600066.SH
600338.SH
301358.SZ
002379.SZ
002407.SZ
002497.SZ
002545.SZ
002709.SZ
002738.SZ
600125.SH
300769.SZ
300438.SZ
688257.SH
688275.SH
603558.SH
600064.SH
688679.SH
601600.SH
002028.SZ
002916.SZ
300274.SZ
300321.SZ
603993.SH
301308.SZ
600021.SH
600118.SH
301200.SZ
688377.SH



```