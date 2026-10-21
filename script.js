// 1. 状态管理
let groceryList = []; // 清单数据
let currentMatch = null; // 当前匹配到的菜品

// 2. DOM 元素获取
const inputName = document.getElementById('input-name');
const inputPrice = document.getElementById('input-price');
const inputQty = document.getElementById('input-qty');
const inputUnit = document.getElementById('input-unit');
const smartTip = document.getElementById('smart-tip');
const tipText = document.getElementById('tip-text');
const listContainer = document.getElementById('grocery-list');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// 3. 智能提示条匹配
inputName.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    currentMatch = null;
    if (!val) { smartTip.classList.add('hidden'); return; }

    // 遍历字典寻找匹配
    for (let key in GUIDE_DATA) {
        const item = GUIDE_DATA[key];
        if (key.includes(val) || item.aliases.some(a => a.includes(val))) {
            currentMatch = { key, ...item };
            break;
        }
    }

    if (currentMatch) {
        tipText.innerText = `🔎 挑${currentMatch.key}：${currentMatch.pick[0]}`;
        // 自动预选单位
        if(currentMatch.units.length > 0) {
             inputUnit.value = currentMatch.units[0];
        }
        smartTip.classList.remove('hidden');
    } else {
        smartTip.classList.add('hidden');
    }
});

// 4. 加入清单算账
document.getElementById('btn-add').addEventListener('click', () => {
    const name = inputName.value.trim();
    const price = parseFloat(inputPrice.value);
    const qty = parseFloat(inputQty.value);
    const unit = inputUnit.value;

    if (!name || isNaN(price) || isNaN(qty) || qty <= 0) {
        alert("请填写完整的菜名、价格和数量！"); return;
    }

    groceryList.push({ name, price, qty, unit, id: Date.now() });
    renderList();
    
    // 清空输入框
    inputName.value = ''; inputPrice.value = ''; inputQty.value = '1';
    smartTip.classList.add('hidden');
});

// 5. 渲染列表与计算总价
function renderList() {
    listContainer.innerHTML = '';
    let totalMoney = 0;

    groceryList.forEach(item => {
        const subTotal = item.price * item.qty;
        totalMoney += subTotal;
        
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong> 
                <span style="color:#888; font-size:12px;">${item.price}元 × ${item.qty}${item.unit}</span>
            </div>
            <div>
                <span style="color:#e74c3c; font-weight:bold;">￥${subTotal.toFixed(2)}</span>
                <button onclick="deleteItem(${item.id})" style="margin-left:10px; color:red; border:none; background:none;">删除</button>
            </div>
        `;
        listContainer.appendChild(li);
    });

    document.getElementById('total-price').innerText = `￥${totalMoney.toFixed(2)}`;
    document.getElementById('total-count').innerText = `共 ${groceryList.length} 件`;
}

window.deleteItem = function(id) {
    groceryList = groceryList.filter(item => item.id !== id);
    renderList();
}

// 6. 弹层控制逻辑
function openModal(htmlContent) {
    modalBody.innerHTML = htmlContent;
    modal.classList.remove('hidden');
}
window.closeModal = function() { modal.classList.add('hidden'); }

// 查看搭配详情
window.openDetail = function() {
    if (!currentMatch) return;
    const html = `
        <h2>${currentMatch.key}</h2>
        <p style="color:#666; font-size:14px;">${currentMatch.category} · 常用单位：${currentMatch.units.join('/')}</p >
        <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        <h3>🔎 怎么挑</h3>
        <ul>${currentMatch.pick.map(p => `<li>${p}</li>`).join('')}</ul>
        <h3>⚖️ 单位参考</h3>
        <p>${currentMatch.refWeight}</p >
        <h3>🍽️ 推荐搭配</h3>
        <div>${currentMatch.pair.map(p => `<span style="background:#eaf7ec; padding:4px 10px; border-radius:20px; margin-right:5px; font-size:14px; color:#2ea043;">${p}</span>`).join('')}</div>
        <p style="color:#888; font-size:13px; margin-top:10px;">提示：${currentMatch.caution}</p >
    `;
    openModal(html);
}

// 单位换算
window.openConvert = function() {
    const html = `
        <h2>⚖️ 单位换算</h2>
        <div style="display:flex; gap:10px; margin:20px 0;">
            <input type="number" id="conv-val" value="1" style="flex:1; padding:10px; font-size:18px;">
            <select id="conv-unit" style="padding:10px; font-size:18px;">
                <option value="斤">斤</option>
                <option value="个">公斤</option>
                <option value="两">两</option>
            </select>
        </div>
        <div id="conv-result" style="background:#f9f9f9; padding:15px; border-radius:10px;">
            <!-- 结果 -->
        </div>
    `;
    openModal(html);
    
    // 绑定换算逻辑
    const valInput = document.getElementById('conv-val');
    const unitSelect = document.getElementById('conv-unit');
    const resDiv = document.getElementById('conv-result');

    const updateConvert = () => {
        const v = parseFloat(valInput.value) || 0;
        const u = unitSelect.value;
        const inGrams = v * UNIT_RATES[u];
        
        resDiv.innerHTML = Object.keys(UNIT_RATES).map(key => {
            const converted = inGrams / UNIT_RATES[key];
            return `<div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>${key}</span>
                        <strong>${key === '克' ? Math.round(converted) : converted.toFixed(2)}</strong>
                    </div>`;
        }).join('');
    };
    
    valInput.addEventListener('input', updateConvert);
    unitSelect.addEventListener('change', updateConvert);
    updateConvert();
}

// 7. 调用 AI 接口 (比赛加分神器)
window.askAI = async function() {
    openModal(`
        <h2>💬 AI帮挑</h2>
        <textarea id="ai-input" placeholder="例如：我想做番茄炒蛋，应该怎么挑番茄？" style="width:100%; height:80px; padding:10px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box;"></textarea>
        <button onclick="sendAI()" class="btn-primary" style="margin-top:10px; width:100%;">发送提问</button>
        <div id="ai-answer" style="margin-top:20px; line-height:1.6; color:#333;"></div>
    `);
}

window.sendAI = async function() {
    const q = document.getElementById('ai-input').value;
    const answerDiv = document.getElementById('ai-answer');
    if (!q) return;
    
    answerDiv.innerHTML = "AI思考中...";
    
    // 【重要】比赛演示时，这里需要换成你在智谱或百度申请的 API_KEY
    // 这里用免费的代理接口或你们自己申请的接口替换
    try {
        // 以下代码以智谱API为例（需结合实际情况修改）
        /*
        const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 你的API_KEY'
            },
            body: JSON.stringify({
                model: "glm-4-flash",
                messages: [{ role: "user", content: q }]
            })
        });
        const data = await res.json();
        answerDiv.innerText = data.choices[0].message.content;
        */
        
        // 演示占位（如果没有配置API_KEY时展示）
        setTimeout(() => {
            answerDiv.innerText = `【AI回答演示】\n挑选番茄时，建议选择果形圆润、表面光滑、摸起来微软且有弹性的。如果要做番茄炒蛋，最好选熟透的，这样汁水多、起沙，味道更浓郁哦。`;
        }, 1500);

    } catch (error) {
        answerDiv.innerText = "网络异常，请稍后再试。";
    }
}