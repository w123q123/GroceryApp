// ================= 1. 状态与元素获取 =================
let groceryList = []; 
let currentMatch = null; 

const inputName = document.getElementById('input-name');
const inputPrice = document.getElementById('input-price');
const inputQty = document.getElementById('input-qty');
const inputUnit = document.getElementById('input-unit');
const smartTip = document.getElementById('smart-tip');
const tipText = document.getElementById('tip-text');
const listContainer = document.getElementById('grocery-list');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const vegGrid = document.getElementById('veg-grid'); // 新增

// ================= 2. 首页渲染快捷卡片 =================
function renderHomeGrid() {
    // 为了首页好看，我们只取字典里的前 8 个作为“热门”展示
    const hotItems = Object.keys(GUIDE_DATA).slice(0, 8); 
    vegGrid.innerHTML = ''; 

    hotItems.forEach(key => {
        const item = GUIDE_DATA[key];
        const card = document.createElement('div');
        card.className = 'veg-card';
        card.innerHTML = `
            <span class="name">${key}</span>
            <span class="cal">${item.calories || 0}卡</span>
        `;
        // 点击卡片直接填入表单
        card.onclick = () => {
            inputName.value = key;
            inputName.dispatchEvent(new Event('input')); // 触发提示条
            document.querySelector('.add-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        vegGrid.appendChild(card);
    });
}
renderHomeGrid(); // 执行渲染

// ================= 3. 智能提示条 =================
inputName.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    currentMatch = null;
    if (!val) { smartTip.classList.add('hidden'); return; }

    for (let key in GUIDE_DATA) {
        const item = GUIDE_DATA[key];
        if (key.includes(val) || (item.aliases && item.aliases.some(a => a.includes(val)))) {
            currentMatch = { key, ...item };
            break;
        }
    }

    if (currentMatch) {
        tipText.innerText = `🔎 挑${currentMatch.key}：${currentMatch.pick[0]}`;
        if(currentMatch.units && currentMatch.units.length > 0) {
             inputUnit.value = currentMatch.units[0];
        }
        smartTip.classList.remove('hidden');
    } else {
        smartTip.classList.add('hidden');
    }
});

// 回车键快捷提交
document.querySelectorAll('.add-form input').forEach(input => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') document.getElementById('btn-add').click();
    });
});

// ================= 4. 加入清单与算账 =================
document.getElementById('btn-add').addEventListener('click', () => {
    const name = inputName.value.trim();
    const price = parseFloat(inputPrice.value);
    let qty = parseFloat(inputQty.value);
    const unit = inputUnit.value;

    if (!name || isNaN(price) || isNaN(qty) || qty <= 0) {
        alert("请填写完整的菜名、价格和数量！"); return;
    }

    if ((unit === '个' || unit === '把' || unit === '根' || unit === '颗') && !Number.isInteger(qty)) {
        alert("按个数/把/根/颗购买时，数量必须是整数！");
        return;
    }

    groceryList.push({ name, price, qty, unit, id: Date.now() });
    renderList();
    
    inputName.value = ''; inputPrice.value = ''; inputQty.value = '1';
    smartTip.classList.add('hidden');
});

function renderList() {
    listContainer.innerHTML = '';
    let totalMoney = 0;

    groceryList.forEach(item => {
        const subTotal = item.price * item.qty;
        totalMoney += subTotal;
        
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <div class="item-left">
                <span class="item-name">${item.name}</span> 
                <span class="item-desc">${item.price}元 × ${item.qty}${item.unit}</span>
            </div>
            <div class="item-right">
                <span class="item-price">￥${subTotal.toFixed(2)}</span>
                <button class="btn-delete" onclick="deleteItem(${item.id})">删除</button>
            </div>
        `;
        listContainer.appendChild(li);
    });

    document.getElementById('total-price').innerText = `￥${totalMoney.toFixed(2)}`;
    document.getElementById('total-count').innerText = `共 ${groceryList.length} 件`;
}

window.deleteItem = function(id) {
    if(confirm("确定要删除这个菜品吗？")) {
        groceryList = groceryList.filter(item => item.id !== id);
        renderList();
    }
}

// ================= 5. 弹层控制 =================
function openModal(htmlContent) {
    modalBody.innerHTML = htmlContent;
    modal.classList.remove('hidden');
}
window.closeModal = function() { modal.classList.add('hidden'); }

// ================= 6. 查看详情卡 =================
window.openDetail = function() {
    if (!currentMatch) return;
    const html = `
        <h2>${currentMatch.key}</h2>
        <p style="color:#666; font-size:14px;">${currentMatch.category || '食材'} · 常用单位：${currentMatch.units ? currentMatch.units.join('/') : '斤'}</p >
        <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        <h3>🔎 怎么挑</h3>
        <ul>${currentMatch.pick.map(p => `<li>${p}</li>`).join('')}</ul>
        
        <h3>⚖️ 单位参考与热量</h3>
        ${currentMatch.refWeight ? `<p style="font-size:14px; color:#555;">${currentMatch.refWeight}</p>` : ''}
        <p style="font-size:14px; color:#e67e22; font-weight:bold;">🔥 每100克约含 ${currentMatch.calories || '未知'} 大卡</p>
        
        <h3>🍽️ 推荐搭配</h3>
        <div class="tag-group">${currentMatch.pair.map(p => `<span class="tag">${p}</span>`).join('')}</div>
        
        ${currentMatch.caution ? `<p style="color:#888; font-size:13px; margin-top:15px; background:#f9f9f9; padding:10px; border-radius:8px;">💡 提示：${currentMatch.caution}</p >` : ''}
    `;
    openModal(html);
}

// ================= 7. 算购买量 =================
window.openConvert = function() {
    const html = `
        <h2>⚖️ 算算能买多少 & 热量预警</h2>
        
        <div style="margin-bottom: 15px;">
            <input type="text" id="calc-name" placeholder="输入菜名 (如:番茄，算热量用)" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box; font-size:16px;">
        </div>

        <div style="display:flex; gap:10px; margin-bottom: 15px;">
            <input type="number" id="calc-price" placeholder="单价" style="flex:1; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:16px;">
            <select id="calc-unit" style="width:120px; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:16px; background:#fff;">
                <option value="斤">元 / 斤</option>
                <option value="千克">元 / 千克</option>
                <option value="两">元 / 两</option>
                <option value="克">元 / 克</option>
            </select>
        </div>

        <div style="margin-bottom: 20px;">
            <input type="number" id="calc-budget" placeholder="想花的钱 (元)" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box; font-size:16px;">
        </div>

        <button onclick="calculateQty()" class="btn-primary" style="width:100%; margin-bottom: 20px;">计算购买量</button>
        
        <div id="calc-result" style="background:#eaf7ec; padding:15px; border-radius:10px; color:#2ea043; font-weight:bold; font-size:16px; display:none; line-height:1.6;"></div>
    `;
    openModal(html);
}

window.calculateQty = function() {
    const name = document.getElementById('calc-name').value.trim();
    const price = parseFloat(document.getElementById('calc-price').value);
    const unit = document.getElementById('calc-unit').value;
    const budget = parseFloat(document.getElementById('calc-budget').value);
    const resDiv = document.getElementById('calc-result');

    if (isNaN(price) || price <= 0 || isNaN(budget) || budget <= 0) {
        alert("请输入大于0的单价和预算金额！"); return;
    }

    let pricePerGram = price;
    if (unit === '斤') pricePerGram = price / 500;
    else if (unit === '千克') pricePerGram = price / 1000;
    else if (unit === '两') pricePerGram = price / 50;

    const totalGrams = budget / pricePerGram;
    let resultHtml = `💰 预算 ${budget} 元，大约可以买：<br>`;
    
    if (totalGrams >= 1000) {
        resultHtml += `<span style="font-size:20px; color:#e74c3c;">${(totalGrams / 1000).toFixed(2)} 千克</span> (约 ${(totalGrams / 500).toFixed(2)} 斤)<br>`;
    } else if (totalGrams >= 50) {
        resultHtml += `<span style="font-size:20px; color:#e74c3c;">${(totalGrams / 500).toFixed(2)} 斤</span> (约 ${Math.round(totalGrams)} 克)<br>`;
    } else {
        resultHtml += `<span style="font-size:20px; color:#e74c3c;">${Math.round(totalGrams)} 克</span><br>`;
    }

    let matchedKey = null;
    for (let key in GUIDE_DATA) {
        if (name.includes(key) || (GUIDE_DATA[key].aliases && GUIDE_DATA[key].aliases.some(a => name.includes(a)))) {
            matchedKey = key; break;
        }
    }

    if (matchedKey) {
        const item = GUIDE_DATA[matchedKey];
        if (item.refWeight) {
            const matchGrams = item.refWeight.match(/(\d+)g/);
            if (matchGrams) {
                const gramsPerItem = parseInt(matchGrams[1]);
                const itemCount = totalGrams / gramsPerItem;
                resultHtml += `💡 小贴士：1个/把约 ${gramsPerItem}g，大约能买 <strong>${itemCount.toFixed(1)} 个/把</strong>。<br>`;
            }
        }
        if (item.calories) {
            const totalCalories = (totalGrams / 100) * item.calories;
            const runKm = (totalCalories / 65).toFixed(1); 
            resultHtml += `<div style="margin-top:10px; padding-top:10px; border-top:1px dashed #b8e6c1;">
                                🔥 <strong>热量预警：</strong>这些${matchedKey}大约含有 <span style="color:#e67e22; font-size:18px;">${Math.round(totalCalories)} 大卡</span>。<br>
                                <span style="font-size:13px; color:#666;">(需慢跑约 ${runKm} 公里才能消耗掉 😅)</span>
                            </div>`;
        }
    } else if (name) {
        resultHtml += `<span style="font-size:12px; color:#888; margin-top:8px; display:block;">* 未匹配到该菜品的数据库，无法估算个数和卡路里。</span>`;
    }

    resDiv.innerHTML = resultHtml;
    resDiv.style.display = 'block';
}

// ================= 8. 挑菜指南列表页 =================
window.openGuide = function() {
    let listHtml = '<h2>🔍 挑菜指南库</h2><div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">';
    
    for(let key in GUIDE_DATA) {
        const item = GUIDE_DATA[key];
        listHtml += `
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; border-left:4px solid var(--main-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="font-size:16px;">${key}</strong>
                    <span style="font-size:12px; color:#666; background:#e0e0e0; padding:2px 8px; border-radius:10px;">${item.category}</span>
                </div>
                <div style="font-size:14px; color:#555; margin-bottom:8px;">👉 ${item.pick[0]}</div>
                <button onclick="quickViewDetail('${key}')" style="background:none; border:none; color:var(--main-color); font-size:13px; padding:0;">查看完整指南 ></button>
            </div>
        `;
    }
    listHtml += '</div>';
    openModal(listHtml);
}

window.quickViewDetail = function(key) {
    currentMatch = { key, ...GUIDE_DATA[key] };
    openDetail();
}

// ================= 9. AI 融合演示 =================
window.askAI = function() {
    openModal(`
        <h2>💬 AI帮挑 (模拟演示)</h2>
        <p style="font-size:13px; color:#888; margin-bottom:10px;">真实比赛时，这里可接入大模型API</p >
        <textarea id="ai-input" placeholder="例如：我想做番茄炒蛋，应该怎么挑番茄？" style="width:100%; height:80px; padding:10px; border:1px solid #ddd; border-radius:8px; box-sizing:border-box; font-size:15px;"></textarea>
        <button onclick="sendAI()" class="btn-primary" style="margin-top:10px; width:100%;">发送提问</button>
        <div id="ai-answer" style="margin-top:20px; line-height:1.6; color:#333; background:#f4f6f4; padding:15px; border-radius:10px; display:none;"></div>
    `);
}

window.sendAI = function() {
    const q = document.getElementById('ai-input').value;
    const answerDiv = document.getElementById('ai-answer');
    if (!q) { alert("请输入你的问题！"); return; }
    
    answerDiv.style.display = 'block';
    answerDiv.innerHTML = "🤖 AI 正在思考中...";
    
    setTimeout(() => {
        answerDiv.innerHTML = `【AI智能回答】<br>挑选番茄做番茄炒蛋时，建议选择<strong>颜色粉红、摸起来微软</strong>的，这样炒出来汁水多、容易起沙。尽量避免买摸起来硬邦邦的催熟番茄。另外，如果你在减脂，建议少放油，番茄本身热量极低，是非常健康的食材！`;
    }, 1200);
}
