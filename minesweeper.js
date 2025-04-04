/**
 * 扫雷自动化脚本
 * 使用方法：在扫雷游戏页面打开控制台，粘贴此代码并回车执行
 * 停止脚本：在控制台输入 stopMinesweeper() 并回车
 * 号多多 hdd.cm 推特低至1毛5
 */
(function() {
    // 配置
    const DELAY_BETWEEN_MOVES = 1000; // 每次移动之间的延迟（毫秒）
    
    // 游戏状态
    let gameState = {
        tiles: [], // 游戏棋盘状态
        rows: 10,  // 行数
        cols: 10,  // 列数
        gameOver: false,
        clickedCells: new Set(), // 记录已点击过的格子
        runningLoop: true // 控制游戏循环是否继续运行
    };
    
    // 全局停止函数
    window.stopMinesweeper = function() {
        console.log('正在停止扫雷脚本...');
        gameState.runningLoop = false;
        console.log('扫雷脚本已停止!');
    };
    
    /**
     * 从DOM中解析当前游戏状态
     */
    function parseGameState() {
        // 根据实际DOM结构调整解析逻辑
        // 在这个游戏中，.gamerow是整个棋盘，包含多个.gamecol，每个.gamecol代表一行
        const gameRow = document.querySelector('.gamerow');
        if (!gameRow) {
            console.error('找不到游戏棋盘，请确保您在扫雷游戏页面上运行此脚本');
            return null;
        }
        
        // 获取所有的gamecol（实际上是行）
        const gameCols = gameRow.querySelectorAll('.gamecol');
        if (!gameCols || gameCols.length === 0) {
            console.error('找不到游戏棋盘行，请确保您在扫雷游戏页面上运行此脚本');
            return null;
        }
        
        // 在这个DOM结构中，gamecol是行，内部div是列
        gameState.rows = gameCols.length;
        gameState.cols = gameCols[0].children.length;
        
        // 初始化空棋盘 - 使用正确的二维数组初始化方式
        gameState.tiles = [];
        for (let y = 0; y < gameState.rows; y++) {
            gameState.tiles[y] = [];
            for (let x = 0; x < gameState.cols; x++) {
                gameState.tiles[y][x] = null;
            }
        }
        
        // 解析每个格子的状态 - 调整为正确的行列理解
        for (let y = 0; y < gameState.rows; y++) {
            const row = gameCols[y]; // gamecol实际上是行
            const cells = row.children; // 内部div是列
            
            for (let x = 0; x < cells.length; x++) {
                const cell = cells[x];
                const tile = cell.querySelector('.tile');
                
                if (!tile) continue;
                
                // 根据用户提供的格子类型判断格子状态
                
                // 1. 判断是否是有数字的格子：有tile-changed类且内容为数字
                const isNumberTile = tile.classList.contains('tile-changed') && 
                                    tile.textContent && !isNaN(parseInt(tile.textContent));
                
                // 2. 判断是否是空白格子：有特定样式属性
                const isEmptyTile = tile.style.backgroundColor === 'transparent' && 
                                  tile.style.color === 'white';
                
                // 3. 判断是否是未点击格子：无特殊类名，内容为空
                const isUnclickedTile = !tile.classList.contains('tile-changed') && 
                                     !tile.classList.contains('tile-flagged') && 
                                     !tile.classList.contains('tile-mine') && 
                                     !tile.classList.contains('bomb') && 
                                     !isEmptyTile && 
                                     (!tile.textContent || tile.textContent.trim() === '');
                
                // 4. 判断是否是游戏结束后显示的雷：含有bomb和bomb-unflagged-won类
                const isUnflaggedBomb = tile.classList.contains('bomb') && 
                                      tile.classList.contains('bomb-unflagged-won');
                
                if (isUnflaggedBomb) {
                    // 游戏结束后显示的雷
                    gameState.tiles[y][x] = 'B';
                    gameState.gameOver = true; // 游戏结束
                } else if (tile.classList.contains('tile-flagged')) {
                    // 已标记为地雷
                    gameState.tiles[y][x] = 'F';
                } else if (tile.classList.contains('tile-mine')) {
                    // 地雷
                    gameState.tiles[y][x] = 'M';
                    gameState.gameOver = true;
                } else if (isNumberTile) {
                    // 有数字的格子
                    gameState.tiles[y][x] = parseInt(tile.textContent);
                } else if (isEmptyTile) {
                    // 空白格子（已翻开但无数字）
                    gameState.tiles[y][x] = 0;
                } else if (isUnclickedTile) {
                    // 未点击的格子
                    gameState.tiles[y][x] = null;
                } else {
                    // 其他情况，默认为未点击
                    console.log(`无法识别的格子类型 at (${x}, ${y})`, tile);
                    gameState.tiles[y][x] = null;
                }
            }
        }
        
        // console.log('当前游戏状态:', gameState);
        return gameState;
    }
    
    /**
     * 点击指定坐标的格子
     */
    function clickTile(x, y) {
        // 检查是否已经点击过这个格子
        const cellKey = `${x},${y}`;
        if (gameState.clickedCells.has(cellKey)) {
            console.warn(`格子 (${x}, ${y}) 已经被点击过，跳过`);
            return false;
        }
        
        // 根据正确的DOM结构理解获取格子
        const gameRow = document.querySelector('.gamerow');
        if (!gameRow) {
            console.error('找不到游戏棋盘');
            return false;
        }
        
        // 获取所有行 (gamecol)
        const gameCols = gameRow.querySelectorAll('.gamecol');
        if (!gameCols || gameCols.length <= y) {
            console.error(`找不到行 ${y}`);
            return false;
        }
        
        // 获取指定行中的所有单元格 (div)
        const cells = gameCols[y].children;
        if (!cells || cells.length <= x) {
            console.error(`找不到列 ${x}`);
            return false;
        }
        
        // 获取指定单元格中的tile元素
        const tile = cells[x].querySelector('.tile');
        if (!tile) {
            console.error(`找不到格子 (${x}, ${y})`);
            return false;
        }
        
        // 根据用户提供的格子类型示例检查格子状态
        
        // 1. 判断是否是有数字的格子：有tile-changed类且内容为数字
        const isNumberTile = tile.classList.contains('tile-changed') && 
                            tile.textContent && !isNaN(parseInt(tile.textContent));
        
        // 2. 判断是否是空白格子：有特定样式属性
        const isEmptyTile = tile.style.backgroundColor === 'transparent' && 
                          tile.style.color === 'white';
        
        // 已翻开或已标记的格子不能点击
        if (isNumberTile || isEmptyTile || tile.classList.contains('tile-flagged')) {
            console.warn(`格子 (${x}, ${y}) 已经被翻开或标记，跳过`);
            return false;
        }
        
        console.log(`点击格子 (${x}, ${y})`);
        
        // 记录已点击的格子
        gameState.clickedCells.add(cellKey);
        
        // 模拟点击事件
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        tile.dispatchEvent(clickEvent);
        return true;
    }
    
    /**
     * 计算下一步最佳点击位置
     */
    function calculateNextMove() {
        const { tiles, rows, cols } = gameState;
        
        // 1. 找出所有已翻开的格子和未翻开的格子
        let revealed = [];  // 已翻开的格子 (x, y, value)
        let unrevealed = [];  // 未翻开的格子 (x, y)
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (tiles[y][x] !== null && tiles[y][x] !== 'F') {
                    if (typeof tiles[y][x] === 'number') {
                        revealed.push([x, y, tiles[y][x]]);
                    }
                } else if (tiles[y][x] === null) {
                    unrevealed.push([x, y]);
                }
            }
        }
        
        // 如果没有已翻开的格子，选择角落位置开始（角落通常更安全）
        if (revealed.length === 0) {
            const corners = [[0, 0], [0, rows-1], [cols-1, 0], [cols-1, rows-1]];
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        // 2. 确定性分析 - 找出确定安全的格子和确定是地雷的格子
        let safeCells = new Set();  // 确定安全的格子
        let mineCells = new Set();  // 确定是地雷的格子
        
        // 创建邻居映射，用于后续分析
        let neighborsMap = {};
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const key = `${x},${y}`;
                neighborsMap[key] = [];
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                            neighborsMap[key].push([nx, ny]);
                        }
                    }
                }
            }
        }
        
        // 第一轮：找出确定安全的格子和确定是地雷的格子
        for (const [x, y, value] of revealed) {
            if (value === 0) {
                // 值为0的格子周围都是安全的
                const key = `${x},${y}`;
                for (const [nx, ny] of neighborsMap[key]) {
                    if (tiles[ny][nx] === null) {
                        safeCells.add(`${nx},${ny}`);
                    }
                }
            } else {
                // 检查是否可以确定某些格子是地雷
                const key = `${x},${y}`;
                const unknownNeighbors = neighborsMap[key].filter(([nx, ny]) => tiles[ny][nx] === null);
                const flaggedNeighbors = neighborsMap[key].filter(([nx, ny]) => tiles[ny][nx] === 'F');
                
                if (unknownNeighbors.length + flaggedNeighbors.length === value) {
                    // 如果未知格子数 + 已标记地雷数 = 数字值，则所有未知格子都是地雷
                    for (const [nx, ny] of unknownNeighbors) {
                        mineCells.add(`${nx},${ny}`);
                    }
                }
            }
        }
        
        // 第二轮：使用已知地雷信息进一步推断
        for (const [x, y, value] of revealed) {
            if (value > 0) {
                const key = `${x},${y}`;
                // 计算周围已知地雷数
                const knownMines = neighborsMap[key].filter(([nx, ny]) => 
                    tiles[ny][nx] === 'F' || mineCells.has(`${nx},${ny}`)
                ).length;
                
                const unknownNeighbors = neighborsMap[key].filter(([nx, ny]) => 
                    tiles[ny][nx] === null && !mineCells.has(`${nx},${ny}`)
                );
                
                // 如果已知地雷数等于格子的值，则其余未知格子都是安全的
                if (knownMines === value && unknownNeighbors.length > 0) {
                    for (const [nx, ny] of unknownNeighbors) {
                        safeCells.add(`${nx},${ny}`);
                    }
                }
            }
        }
        
        // 如果有确定安全的格子，优先选择这些
        if (safeCells.size > 0) {
            // 优先选择周围已翻开格子数量最多的安全格子
            let bestSafeCell = null;
            let maxRevealedNeighbors = -1;
            
            for (const cellKey of safeCells) {
                const [x, y] = cellKey.split(',').map(Number);
                const key = `${x},${y}`;
                const revealedNeighbors = neighborsMap[key].filter(([nx, ny]) => 
                    typeof tiles[ny][nx] === 'number'
                ).length;
                
                if (revealedNeighbors > maxRevealedNeighbors) {
                    maxRevealedNeighbors = revealedNeighbors;
                    bestSafeCell = [x, y];
                }
            }
            
            if (bestSafeCell) {
                console.log('找到安全格子:', bestSafeCell);
                return bestSafeCell;
            }
            
            // 如果没有基于邻居数量的最佳选择，随机选一个安全格子
            const safeCellsArray = Array.from(safeCells).map(key => key.split(',').map(Number));
            const randomSafeCell = safeCellsArray[Math.floor(Math.random() * safeCellsArray.length)];
            console.log('随机安全格子:', randomSafeCell);
            return randomSafeCell;
        }
        
        // 3. 概率分析 - 当没有确定性结果时
        // 为每个未知格子计算地雷概率
        let probabilityMap = {};
        for (const [x, y] of unrevealed) {
            if (!mineCells.has(`${x},${y}`)) {
                probabilityMap[`${x},${y}`] = 0.0;
            }
        }
        
        // 计算每个数字格子对周围未知格子的地雷概率贡献
        for (const [x, y, value] of revealed) {
            if (value > 0) {
                const key = `${x},${y}`;
                const unknownNeighbors = neighborsMap[key].filter(([nx, ny]) => 
                    tiles[ny][nx] === null && !mineCells.has(`${nx},${ny}`)
                );
                
                if (unknownNeighbors.length > 0) {
                    // 计算周围已知地雷数
                    const knownMines = neighborsMap[key].filter(([nx, ny]) => 
                        tiles[ny][nx] === 'F' || mineCells.has(`${nx},${ny}`)
                    ).length;
                    
                    // 剩余地雷数
                    const remainingMines = value - knownMines;
                    
                    // 每个未知格子的地雷概率
                    if (remainingMines > 0) {
                        const mineProb = remainingMines / unknownNeighbors.length;
                        for (const [nx, ny] of unknownNeighbors) {
                            const cellKey = `${nx},${ny}`;
                            if (cellKey in probabilityMap) {
                                // 取最大概率值，因为一个格子可能被多个数字格子影响
                                probabilityMap[cellKey] = Math.max(probabilityMap[cellKey], mineProb);
                            }
                        }
                    }
                }
            }
        }
        
        // 4. 高级启发式 - 边缘优先策略
        // 对于概率相同的格子，优先选择边缘格子（有更多已知邻居的格子）
        let edgeScores = {};
        for (const cellKey in probabilityMap) {
            const [x, y] = cellKey.split(',').map(Number);
            const key = `${x},${y}`;
            // 计算已知邻居数量
            const knownNeighbors = neighborsMap[key].filter(([nx, ny]) => 
                typeof tiles[ny][nx] === 'number'
            ).length;
            edgeScores[cellKey] = knownNeighbors;
        }
        
        // 5. 选择最佳格子 - 地雷概率最低且边缘分数最高的格子
        let bestCell = null;
        let minProbability = Infinity;
        let maxEdgeScore = -1;
        
        for (const cellKey in probabilityMap) {
            const prob = probabilityMap[cellKey];
            if (prob < minProbability || (prob === minProbability && edgeScores[cellKey] > maxEdgeScore)) {
                minProbability = prob;
                maxEdgeScore = prob === minProbability ? edgeScores[cellKey] : edgeScores[cellKey];
                bestCell = cellKey.split(',').map(Number);
            }
        }
        
        // 如果找到了最佳格子
        if (bestCell) {
            console.log(`基于概率的最佳格子: (${bestCell[0]}, ${bestCell[1]}) (概率: ${minProbability}, 边缘分: ${maxEdgeScore})`);
            return bestCell;
        }
        
        // 6. 后备策略 - 如果上述方法都失败
        // 随机选择一个非地雷的未知格子
        const safeUnknown = unrevealed.filter(([x, y]) => !mineCells.has(`${x},${y}`));
        if (safeUnknown.length > 0) {
            const randomCell = safeUnknown[Math.floor(Math.random() * safeUnknown.length)];
            console.log(`随机格子 (后备): (${randomCell[0]}, ${randomCell[1]})`);
            return randomCell;
        }
        
        // 最后的后备 - 随机选择任意未知格子
        if (unrevealed.length > 0) {
            const lastResort = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            console.log(`最后手段: (${lastResort[0]}, ${lastResort[1]})`);
            return lastResort;
        }
        
        // 如果所有方法都失败，尝试找到任何未点击过的格子
        let anyUnclickedCell = null;
        
        // 遍历所有格子，寻找未点击过的
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (tiles[y][x] === null && !gameState.clickedCells.has(`${x},${y}`)) {
                    anyUnclickedCell = [x, y];
                    console.log(`找到未点击的格子: (${x}, ${y})`);
                    return anyUnclickedCell;
                }
            }
        }
        
        // 如果没有找到未点击的格子，停止游戏循环
        console.log('所有格子都已点击过或被标记，游戏可能已完成');
        gameState.runningLoop = false;
        return null; // 返回null表示没有可点击的格子
    }
    
    /**
     * 游戏主循环
     */
    function gameLoop() {
        // 检查是否应该停止循环
        if (!gameState.runningLoop) {
            console.log('游戏循环已停止');
            return;
        }
        
        // 解析当前游戏状态
        if (!parseGameState()) {
            console.error('无法解析游戏状态，5秒后重试...');
            if (gameState.runningLoop) {
                setTimeout(gameLoop, 5000);
            }
            return;
        }
        
        // 检查游戏是否结束
        if (gameState.gameOver) {
            console.log('游戏结束!');
            return;
        }
        
        // 计算下一步
        const nextMove = calculateNextMove();
        
        // 如果没有可用的下一步，结束游戏循环
        if (!nextMove) {
            console.log('没有可用的下一步，停止游戏循环');
            return;
        }
        
        const [nextX, nextY] = nextMove;
        
        // 执行点击
        if (clickTile(nextX, nextY)) {
            // 延迟后继续下一步
            if (gameState.runningLoop) {
                setTimeout(gameLoop, DELAY_BETWEEN_MOVES);
            }
        } else {
            console.error('点击失败，3秒后重试...');
            // 添加到已点击列表，避免重复尝试
            gameState.clickedCells.add(`${nextX},${nextY}`);
            if (gameState.runningLoop) {
                setTimeout(gameLoop, 3000);
            }
        }
    }
    
    // 启动游戏
    console.log('扫雷自动化脚本已启动!');
    console.log('要停止脚本，请在控制台输入 stopMinesweeper() 并回车');
    console.log('%c号多多 hdd.cm 推特低至1毛5', 'color: #ff5722; font-size: 14px; font-weight: bold;');
    console.log('%c访问：%chttps://hdd.cm/', 'color: #ff5722; font-size: 14px;', 'color: #2196F3; font-size: 14px; text-decoration: underline; cursor: pointer;');
    setTimeout(gameLoop, 1000); // 延迟1秒启动，确保页面已完全加载
})();