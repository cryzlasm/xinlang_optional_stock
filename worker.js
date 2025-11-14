// ==UserScript==
// @name         新浪股票自选导入工具
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  批量导入自选股到新浪财经自选分组
// @author       You
// @match        https://finance.sina.com.cn/*
// @match        https://*.finance.sina.com.cn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      watchlist.finance.sina.com.cn
// ==/UserScript==

(function() {
    'use strict';

    // 添加必要的CSS样式
    GM_addStyle(`
        #stock-import-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-width: 90%;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            padding: 20px;
            font-family: Arial, sans-serif;
        }

        #stock-import-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        }

        #stock-import-modal h2 {
            margin-top: 0;
            color: #333;
        }

        #stock-import-modal label {
            display: block;
            margin: 15px 0 5px;
            font-weight: bold;
            color: #555;
        }

        #stock-import-modal select,
        #stock-import-modal textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }

        #stock-import-modal textarea {
            min-height: 200px;
            resize: vertical;
            font-family: monospace;
        }

        #stock-import-buttons {
            text-align: right;
            margin-top: 20px;
        }

        .stock-import-btn {
            padding: 10px 20px;
            margin-left: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        #import-confirm-btn {
            background-color: #4CAF50;
            color: white;
        }

        #import-cancel-btn {
            background-color: #f44336;
            color: white;
        }

        #import-progress {
            margin-top: 15px;
            display: none;
        }

        #import-progress-bar {
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }

        #import-progress-fill {
            height: 100%;
            background-color: #4CAF50;
            width: 0%;
            transition: width 0.3s;
        }

        #import-status {
            margin-top: 10px;
            font-size: 14px;
        }
    `);

    // 创建模态框元素
    function createModal() {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'stock-import-overlay';
        overlay.addEventListener('click', hideModal);

        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'stock-import-modal';
        modal.innerHTML = `
            <h2>导入自选股</h2>
            <label for="group-selector">选择分组:</label>
            <select id="group-selector">
                <option value="">加载中...</option>
            </select>

            <label for="stock-list">股票代码列表 (每行一个):</label>
            <textarea id="stock-list" placeholder="例如:
600000.SH
000001.SZ
688001.SH"></textarea>

            <div id="import-progress">
                <div id="import-progress-bar">
                    <div id="import-progress-fill"></div>
                </div>
                <div id="import-status">准备导入...</div>
            </div>

            <div id="stock-import-buttons">
                <button id="import-cancel-btn" class="stock-import-btn">取消</button>
                <button id="import-confirm-btn" class="stock-import-btn">导入</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // 绑定事件
        document.getElementById('import-cancel-btn').addEventListener('click', hideModal);
        document.getElementById('import-confirm-btn').addEventListener('click', importStocks);
        modal.addEventListener('click', (e) => e.stopPropagation());

        // 加载分组列表
        loadGroups();
    }

    // 显示模态框
    function showModal() {
        let modal = document.getElementById('stock-import-modal');
        let overlay = document.getElementById('stock-import-overlay');

        if (!modal) {
            createModal();
            modal = document.getElementById('stock-import-modal');
            overlay = document.getElementById('stock-import-overlay');
        }

        overlay.style.display = 'block';
        modal.style.display = 'block';

        // 清空之前的状态
        document.getElementById('import-progress').style.display = 'none';
        document.getElementById('stock-list').value = '';
    }

    // 隐藏模态框
    function hideModal() {
        const modal = document.getElementById('stock-import-modal');
        const overlay = document.getElementById('stock-import-overlay');

        if (modal) modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }

    // 加载分组列表
    function loadGroups() {
        showProgress('正在加载分组列表...');

        // 生成随机回调函数名
        const callbackName = 'jQuery' + Math.floor(Math.random() * 1000000000000000) + '_' + Date.now();

        // 构建API URL
        const url = `https://watchlist.finance.sina.com.cn/portfolio/api/openapi.php/PortfolioService.getPyList?callback=${callbackName}&type=cn`;

        // 使用GM_xmlhttpRequest发送请求
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'accept': '*/*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'sec-ch-ua': '"Not_A Brand";v="99", "Chromium";v="142"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'script',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-site': 'same-site',
                'referer': 'https://i.finance.sina.com.cn/'
            },
            onload: function(response) {
                try {
                    // 提取JSON数据
                    const jsonData = response.responseText.replace(/\/\*.*?\*\//g, '').trim();
                    const jsonStart = jsonData.indexOf('(');
                    const jsonEnd = jsonData.lastIndexOf(')');

                    if (jsonStart === -1 || jsonEnd === -1) {
                        throw new Error('无效的响应格式: ' + jsonData.substring(0, 100));
                    }

                    const jsonString = jsonData.substring(jsonStart + 1, jsonEnd);
                    const data = JSON.parse(jsonString);

                    // 检查是否有错误
                    if (data.result && data.result.status && data.result.status.code !== 0) {
                        throw new Error(data.result.status.msg || '获取分组失败');
                    }

                    // 填充分组选择器
                    const selector = document.getElementById('group-selector');
                    selector.innerHTML = '';

                    if (data.result && data.result.data && data.result.data.length > 0) {
                        data.result.data.forEach(group => {
                            const option = document.createElement('option');
                            option.value = group.pid;
                            option.textContent = group.name;
                            selector.appendChild(option);
                        });
                    } else {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = '暂无分组';
                        selector.appendChild(option);
                    }

                    hideProgress();
                } catch (error) {
                    console.error('解析分组数据失败:', error);
                    const selector = document.getElementById('group-selector');
                    selector.innerHTML = '<option value="">加载失败</option>';
                    showError('加载分组失败: ' + error.message);
                }
            },
            onerror: function(error) {
                console.error('加载分组失败:', error);
                const selector = document.getElementById('group-selector');
                selector.innerHTML = '<option value="">加载失败</option>';
                showError('网络错误，请检查网络连接: ' + error.statusText);
            }
        });
    }

    // 显示进度
    function showProgress(message) {
        const progress = document.getElementById('import-progress');
        const status = document.getElementById('import-status');

        progress.style.display = 'block';
        status.textContent = message;
    }

    // 隐藏进度
    function hideProgress() {
        const progress = document.getElementById('import-progress');
        progress.style.display = 'none';
    }

    // 更新进度条
    function updateProgress(percent, message) {
        const fill = document.getElementById('import-progress-fill');
        const status = document.getElementById('import-status');

        fill.style.width = percent + '%';
        status.textContent = message;
    }

    // 显示错误信息
    function showError(message) {
        const status = document.getElementById('import-status');
        status.textContent = '错误: ' + message;
        status.style.color = '#f44336';

        // 3秒后恢复正常的颜色
        setTimeout(() => {
            status.style.color = '#000';
        }, 3000);
    }

    // 显示成功信息
    function showSuccess(message) {
        const status = document.getElementById('import-status');
        status.textContent = message;
        status.style.color = '#4CAF50';

        // 3秒后恢复正常的颜色
        setTimeout(() => {
            status.style.color = '#000';
        }, 3000);
    }

    // 导入股票
    function importStocks() {
        const groupId = document.getElementById('group-selector').value;
        const stockListText = document.getElementById('stock-list').value.trim();

        if (!groupId) {
            showError('请选择一个分组');
            return;
        }

        if (!stockListText) {
            showError('请输入股票代码列表');
            return;
        }

        // 解析股票代码列表
        const stockCodes = stockListText.split('\n')
            .map(code => code.trim())
            .filter(code => code.length > 0);

        if (stockCodes.length === 0) {
            showError('没有有效的股票代码');
            return;
        }

        // 开始导入过程
        performImport(groupId, stockCodes);
    }

    // 执行导入操作
    function performImport(groupId, stockCodes) {
        showProgress('开始导入股票...');
        updateProgress(0, `准备导入 ${stockCodes.length} 只股票`);

        let imported = 0;
        let failed = 0;
        const total = stockCodes.length;
        const failedStocks = [];

        const importNext = () => {
            if (imported + failed >= total) {
                if (failed === 0) {
                    updateProgress(100, `导入完成! 成功导入 ${imported} 只股票`);
                    showSuccess(`导入完成! 成功导入 ${imported} 只股票`);
                } else {
                    updateProgress(100, `导入完成! 成功导入 ${imported} 只股票, ${failed} 只失败`);
                    if (failedStocks.length > 0) {
                        const failedList = failedStocks.join(', ');
                        showError(`导入完成! 成功: ${imported}, 失败: ${failed}. 失败股票: ${failedList}`);
                    }
                }
                return;
            }

            const stockCode = stockCodes[imported + failed];
            updateProgress(((imported + failed) / total) * 100, `正在导入: ${stockCode} (${imported + failed + 1}/${total})`);

            // 转换股票代码格式
            const scode = convertStockCode(stockCode);

            // 生成随机回调函数名
            const callbackName = 'jQuery' + Math.floor(Math.random() * 1000000000000000) + '_' + Date.now();

            // 构建API URL
            const url = `https://watchlist.finance.sina.com.cn/portfolio/api/openapi.php/HoldV2Service.appendSymbol?callback=${callbackName}&scode=${encodeURIComponent(scode)}&source=pc_mzx&pid=${groupId}`;

            // 使用GM_xmlhttpRequest发送请求
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'accept': '*/*',
                    'accept-language': 'zh-CN,zh;q=0.9',
                    'sec-ch-ua': '"Not_A Brand";v="99", "Chromium";v="142"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'script',
                    'sec-fetch-mode': 'no-cors',
                    'sec-fetch-site': 'same-site',
                    'referer': 'https://i.finance.sina.com.cn/'
                },
                onload: function(response) {
                    try {
                        // 提取JSON数据
                        const jsonData = response.responseText.replace(/\/\*.*?\*\//g, '').trim();
                        const jsonStart = jsonData.indexOf('(');
                        const jsonEnd = jsonData.lastIndexOf(')');

                        if (jsonStart === -1 || jsonEnd === -1) {
                            throw new Error('无效的响应格式: ' + jsonData.substring(0, 100));
                        }

                        const jsonString = jsonData.substring(jsonStart + 1, jsonEnd);
                        const data = JSON.parse(jsonString);

                        // 检查是否有错误
                        if (data.result && data.result.status && data.result.status.code === 0) {
                            imported++;
                        } else {
                            failed++;
                            const errorMsg = data.result && data.result.status ? data.result.status.msg : '未知错误';
                            failedStocks.push(stockCode + '(' + errorMsg + ')');
                        }
                    } catch (error) {
                        console.error('导入股票失败:', stockCode, error);
                        failed++;
                        failedStocks.push(stockCode + '(解析错误: ' + error.message + ')');
                    }

                    // 继续导入下一个
                    setTimeout(importNext, 200); // 稍微延时以避免请求过快
                },
                onerror: function(error) {
                    console.error('导入股票失败:', stockCode, error);
                    failed++;
                    failedStocks.push(stockCode + '(网络错误: ' + error.statusText + ')');

                    // 继续导入下一个
                    setTimeout(importNext, 200);
                }
            });
        };

        importNext();
    }

    // 转换股票代码格式
    function convertStockCode(code) {
        // 将标准格式转换为新浪格式
        // 例如: 600000.SH -> sh600000@cn, 000001.SZ -> sz000001@cn
        let sinaCode = '';
        if (code.endsWith('.SH')) {
            sinaCode = 'sh' + code.replace('.SH', '');
        } else if (code.endsWith('.SZ')) {
            sinaCode = 'sz' + code.replace('.SZ', '');
        } else if (code.startsWith('6')) {
            // 上交所股票通常以6开头
            sinaCode = 'sh' + code;
        } else {
            // 其他情况默认为深交所
            sinaCode = 'sz' + code;
        }

        // 添加 @cn 后缀
        return sinaCode + '@cn';
    }

    // 初始化脚本
    function init() {
        // 创建触发按钮
        const triggerButton = document.createElement('button');
        triggerButton.textContent = '导入自选股';
        triggerButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 9998;
            font-size: 14px;
        `;
        triggerButton.addEventListener('click', showModal);
        document.body.appendChild(triggerButton);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();