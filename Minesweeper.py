from httpx import AsyncClient
from web3 import AsyncWeb3
from eth_account.messages import encode_defunct
import random
import asyncio

class SWEEPER:
    def __init__(self):
        self.client = AsyncClient()
        self.url = "https://www.magicnewton.com/portal/api/userQuests"
        self.questId = "44ec9674-6125-4f88-9e18-8d6d6be8f156"
        self.web3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider("https://1rpc.io/eth"))
        self.account = self.web3.eth.account.create()
        self.csrfToken = None
        self.userQuestId = None
        self.tiles = None

    async def get_csrf(self):
        try:
            response = await self.client.get("https://www.magicnewton.com/portal/api/auth/csrf")
            if "csrfToken" in response.text:
                self.csrfToken = response.json()["csrfToken"]
                return True
            else:
                return False
        except Exception as e:
            print(f"Error getting CSRF: {e}")
            return False
            
    async def login(self):
        try:
            if not await self.get_csrf():
                return False
            msg = f"www.magicnewton.com wants you to sign in with your Ethereum account:\n{self.account.address}\n\n\nURI: https://www.magicnewton.com\nVersion: 1\nChain ID: undefined\nNonce: {self.csrfToken}\nIssued At: undefined"
            signed = self.account.sign_message(encode_defunct(text=msg))
            json_data = {
                "message": msg,
                "signature": signed.signature.hex(),
                "redirect": "false",
                "recaptchaToken": "03AFcWeA64Wg9_xRc3eq-TSLcGkMB1TpImXeh4ET9k1zzoyYEb2qIgvNvUrTnsc3zm2aHwK34zSpLn-3Fy_Iti5xh_yGXi-NtujZPmlVa-6NpzXq7idYivez630A-HC9ag4Ng_cATHlS3n7RKeuXsraAfDTLOUUJHaPy2klCT9yQ59wYBrUUm452nvnFroekgtoja0aRAayf2PgKspccAlEC5CyX3ETkviARTAk86EAFqWp7L_o3Fk1eNE1coItTgj6Q5Q44jyhZWydQw1SL6ZlQIOdx9dafPca2A6oo52pjVQE1nJhef3OAHE7Zu3pmEILB8TwtF3uAhna00eM4s4mgYP5Gtzyupt4TOeJ0WveDexKwMp78nSqFZy6YzFvKfEEXJHHohyOOkH5mnqO2pc5sQhGDRUkB01u5UwEiG7YMaqYcHl8RuUYDshy93W5CoBE2cm_RTco9O8mYjtZsXBHQYKYMPX2VhiD79bbHr5odariwmvPeNuG5mM1lbUj0ixs6HB2pJj48sZhF2VbtiR12d0bmQIrgS4H50iivxWw35Hwtwplpo0QLeqvwDjLmCl5r07c8ZbK-HF-ihjJ_HjkX7_WhUw-MoCE6-cU1tXDq1Dbzl6aI0Db5jwlMaba9U6xgf8Gl77hKBXjqY3mH9SJ5q6iwG1KJ9ofqYMkNmGUuytkxrI4UaeRCzamvs0xomJrpvSa8hgpKOvSZ5vBRFsC-W0UNe-HLH5a3Er2qhuTeYmA6UQJhFM4lhyqA9vHW0aNBJBHgqjjPcnAgXz-SQPRclL8bjWlxJw0lVYn4WY56jNPiSX7ZORFjlyh-6D-AxEQIboh04uSYPqSkGD-JIZ4gIDlPWTpDS1kLrM0ZdBIGP74tWyxJAuqwjWC1hF-GG-ruhOTB5ihcveN27LOra-eop4SekTVuho4iPIce_KNRHqJqhKWp1B4CaB_Fq9E6r7znfAbqKSTQWLzgDr1G-t2BXxW8zNBUN1asKqbByTu3_MFz6IKE_dKz2bTPZMtK9OfLpeSaVHO0NpKrMXXciKTPx6jSoFEzKTAVCHd9vTaATY70reXMXz-jz1J6m3KEmwpRT-BYXGou-9LtvE_S-25PhD636BhyTOZCX33qQ58eTUAf0bycxXOTs4hNSLbwSmFNJaXgh-92LawejbD2PzHJqBkZRgeWj9ir7vzGET4FReWkIZ5iise8hR5-UbrpMChSU26lp5LWk4PtrPUawGnA8dQXqpWIafprR0_n4OZYmGP_xFbqDD4lUQc5Ztmz_P5BQHSsTmWYAa3z4arhpLNwW87u5iope8ZFniq5INTkxqg5UzPHmX_uqMORyerEpMCijhChxC4pvqGv4caqvkc7-cvPeRmsoZBgKSat-3IOiDn9nCGq4Tri__oyKchnS3DqGsdcbb3A5CvPyuNyguaDGI1uig2GEpFKtqmpeRgDJtvkTLkgZJ46b6JuHDXIfORIDmYHLTn_LY8nhPpe5QMs_7ILbCiG1PE2TALTzKThDb485Wl0Qic6EmvJcZ4z45lysO9msC8z4tlqrXuk-9HLae7sxdXDsw5G7J8drHaaSgB8ILipntOUx6YPuSP_NAHzS5MyXx8oiZ2nT4FsxPGNW5pcBe4_Gcocq1q5xEUydhuvksmINlLGQjLyo955vp7PBWhDR5z9epqPx4CJniJGm8_EJ4Z3LFDvlXA0XctyMVo60ZVL2A-WpvOA9l-o5QMJ2iPUuc6u5zMjHFbDN82HQvIZ8NlV4xVXhOY8-TTz9kb7IZT7MJICrmDVVdDkQrZvsoGbVJajWO7SrFP6pVVyoLhJRElcJfcCyKsv4bQRy27lRseZ5-MucswSFhi5KN4CAmxGFdicEqCAVz82LuhTQDNP1uXxxYUtL0OxpbHhPVLzkLTOogy1C0sPPzGk3-5zpBF44HNbYLbGM9Fd1sk13AfIrFjrEzHd3WDQt4IjTI-Lo7RzdKGogXrNwrNho5CHiZCICcnpFIco-REtUYW6rz1cNUsNuK6V_SsI1YNpDzjD5fqyZ5xy1aG8D6JLweM6PLd57W1WB_vXw6vBzOKJa8FYINJvfDTobPsqo8ZJBAm9IcD-dHBNinMGvsW09EWF2eKL-sH828NriFL2FBPxPxTdoC4KTLJGASsy8_2t8UJoIo5o6lcl-sQOSFWV5CUnTUuZ44CtaMjQAPios2x8tSlNDEOkffunUvAPzYctuSlNVhXFVMCzWwOkCjZyaovPqFBPIM7GAbl-16qFIQk7VlVyDkXSbI2MJsNeNot0NFMZuKQ48K7CU",
                "refCode": "",
                "botScore": "1",
                "csrfToken": self.csrfToken,
                "callbackUrl": "https://www.magicnewton.com/portal",
                "json": "true"
            }
            response = await self.client.post("https://www.magicnewton.com/portal/api/auth/callback/credentials", json=json_data)
            return response.json()
        except Exception as e:
            print(f"Error signing message: {e}")
            return None

    async def start_game(self):
        self.client.cookies.update({"__Secure-next-auth.session-token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..gEBAteKjcxgDkPK3.IFVMBFl9VESnXrVjfgDnbuVI3WzmtPNjM6DQA81MSEajTFyzDBJ9JAwXNIT7LBybQ1YyDDNW_RYpoo7jSQMwiL_K0XFWrzmjTxO8l_tN1uFLBqwa4Tyreq7Jru3r5YIq6PWEsnEYYe8IpoC3uohpnY1a0DJ7ypi0KZ6OMrgEwqVSc-Hx-dFub7TlEW-e9BlvuD9no1SW3Ms82qUx7b4gbVm1p79Bqjz8s-dAkO5fsKo7YwhKCF7TggpGe1OZRxI9.ygaanW8tjf6g2YYmMQ-7hQ"})
        json_data = {
            "questId": self.questId,
            "metadata": {
                "action": "START",
                "difficulty": "EASY"
            }
        }
        response = await self.client.post(self.url, json=json_data)
        if "Max games reached for today" in response.text:
            print("今天扫雷次数已用完")
            return False
        if "_minesweeper" in response.text:
            self.userQuestId = response.json()['data']['id']
            self.tiles = response.json()['data']['_minesweeper']['tiles']
            return await self.get_quest()
        return False
    
    async def get_quest(self):
        x, y = self.calculate_next_move()
        print(f"点击 ({x}, {y})")
        json_data = {
            "questId": self.questId,
            "metadata": {
                "action": "CLICK",
                "userQuestId": self.userQuestId,
                "x": x,
                "y": y
            }
        }
        response = await self.client.post(self.url, json=json_data)
        if "_minesweeper" in response.text:
            gameOver = response.json()['data']['_minesweeper']['gameOver']
            if gameOver:
                null_count = response.text.count("null")
                print(f"Game Over, {null_count} 格子未打开")
                return await self.get_credits()
            self.tiles = response.json()['data']['_minesweeper']['tiles']
            return await self.get_quest()
        return False
        
    async def get_credits(self):
        response = await self.client.get(self.url)
        print(response.json())

    def calculate_next_move(self):
        """计算下一步最佳点击位置，使用高级扫雷算法"""
        rows = len(self.tiles)
        cols = len(self.tiles[0]) if rows > 0 else 0
        
        # 1. 找出所有已翻开的格子和未翻开的格子
        revealed = []  # 已翻开的格子 (x, y, value)
        unrevealed = []  # 未翻开的格子 (x, y)
        
        for y in range(rows):
            for x in range(cols):
                if self.tiles[y][x] is not None:
                    revealed.append((x, y, self.tiles[y][x]))
                else:
                    unrevealed.append((x, y))
        
        # 如果没有已翻开的格子，选择角落位置开始（角落通常更安全）
        if not revealed:
            # 优先选择角落，然后是边缘，最后是中间
            corners = [(0, 0), (0, rows-1), (cols-1, 0), (cols-1, rows-1)]
            
            return random.choice(corners)
        
        # 2. 确定性分析 - 找出确定安全的格子和确定是地雷的格子
        safe_cells = set()  # 确定安全的格子
        mine_cells = set()  # 确定是地雷的格子
        
        # 创建邻居映射，用于后续分析
        neighbors_map = {}
        for y in range(rows):
            for x in range(cols):
                neighbors_map[(x, y)] = []
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        if dx == 0 and dy == 0:
                            continue
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < cols and 0 <= ny < rows:
                            neighbors_map[(x, y)].append((nx, ny))
        
        # 第一轮：找出确定安全的格子和确定是地雷的格子
        for x, y, value in revealed:
            if value == 0:
                # 值为0的格子周围都是安全的
                for nx, ny in neighbors_map[(x, y)]:
                    if self.tiles[ny][nx] is None:
                        safe_cells.add((nx, ny))
            else:
                # 检查是否可以确定某些格子是地雷
                unknown_neighbors = [(nx, ny) for nx, ny in neighbors_map[(x, y)] if self.tiles[ny][nx] is None]
                if len(unknown_neighbors) == value:
                    # 如果未知格子数等于数字，则所有未知格子都是地雷
                    for nx, ny in unknown_neighbors:
                        mine_cells.add((nx, ny))
        
        # 第二轮：使用已知地雷信息进一步推断
        for x, y, value in revealed:
            if value > 0:
                # 计算周围已知地雷数
                known_mines = sum(1 for nx, ny in neighbors_map[(x, y)] if (nx, ny) in mine_cells)
                unknown_neighbors = [(nx, ny) for nx, ny in neighbors_map[(x, y)] 
                                    if self.tiles[ny][nx] is None and (nx, ny) not in mine_cells]
                
                # 如果已知地雷数等于格子的值，则其余未知格子都是安全的
                if known_mines == value and unknown_neighbors:
                    for nx, ny in unknown_neighbors:
                        safe_cells.add((nx, ny))
        
        # 如果有确定安全的格子，优先选择这些
        if safe_cells:
            # 优先选择周围已翻开格子数量最多的安全格子
            best_safe_cell = None
            max_revealed_neighbors = -1
            
            for x, y in safe_cells:
                revealed_neighbors = sum(1 for nx, ny in neighbors_map[(x, y)] 
                                      if 0 <= nx < cols and 0 <= ny < rows and self.tiles[ny][nx] is not None)
                if revealed_neighbors > max_revealed_neighbors:
                    max_revealed_neighbors = revealed_neighbors
                    best_safe_cell = (x, y)
            
            if best_safe_cell:
                return best_safe_cell
            
            # 如果没有基于邻居数量的最佳选择，随机选一个安全格子
            safe_cell = random.choice(list(safe_cells))
            return safe_cell
        
        # 3. 概率分析 - 当没有确定性结果时
        # 为每个未知格子计算地雷概率
        probability_map = {cell: 0.0 for cell in unrevealed if cell not in mine_cells}
        
        # 计算每个数字格子对周围未知格子的地雷概率贡献
        for x, y, value in revealed:
            if value > 0:
                unknown_neighbors = [(nx, ny) for nx, ny in neighbors_map[(x, y)] 
                                   if self.tiles[ny][nx] is None and (nx, ny) not in mine_cells]
                if unknown_neighbors:
                    # 计算周围已知地雷数
                    known_mines = sum(1 for nx, ny in neighbors_map[(x, y)] if (nx, ny) in mine_cells)
                    # 剩余地雷数
                    remaining_mines = value - known_mines
                    # 每个未知格子的地雷概率
                    if remaining_mines > 0:
                        mine_prob = remaining_mines / len(unknown_neighbors)
                        for nx, ny in unknown_neighbors:
                            if (nx, ny) in probability_map:
                                # 取最大概率值，因为一个格子可能被多个数字格子影响
                                probability_map[(nx, ny)] = max(probability_map[(nx, ny)], mine_prob)
        
        # 4. 高级启发式 - 边缘优先策略
        # 对于概率相同的格子，优先选择边缘格子（有更多已知邻居的格子）
        edge_scores = {}
        for cell in probability_map:
            x, y = cell
            # 计算已知邻居数量
            known_neighbors = sum(1 for nx, ny in neighbors_map[(x, y)] 
                               if 0 <= nx < cols and 0 <= ny < rows and self.tiles[ny][nx] is not None)
            edge_scores[cell] = known_neighbors
        
        # 5. 选择最佳格子 - 地雷概率最低且边缘分数最高的格子
        best_cell = None
        min_probability = float('inf')
        max_edge_score = -1
        
        for cell, prob in probability_map.items():
            if prob < min_probability or (prob == min_probability and edge_scores[cell] > max_edge_score):
                min_probability = prob
                max_edge_score = edge_scores[cell] if prob == min_probability else edge_scores[cell]
                best_cell = cell
        
        # 如果找到了最佳格子
        if best_cell:
            return best_cell
        
        # 6. 后备策略 - 如果上述方法都失败
        # 随机选择一个非地雷的未知格子
        safe_unknown = [cell for cell in unrevealed if cell not in mine_cells]
        if safe_unknown:
            random_cell = random.choice(safe_unknown)
            return random_cell
        
        # 最后的后备 - 随机选择任意未知格子
        if unrevealed:
            last_resort = random.choice(unrevealed)
            return last_resort
        
        # 如果所有方法都失败，选择棋盘中间位置
        center_x, center_y = cols // 2, rows // 2
        return center_x, center_y

    

async def main():
    await SWEEPER().start_game()

if __name__ == "__main__":
    asyncio.run(main())