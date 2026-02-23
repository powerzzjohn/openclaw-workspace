#!/usr/bin/env python3
"""
图文排版工具 - 生成小红书风格的图文卡片
Usage: python3 xiaohongshu_gen.py --text "你的文字内容" --output card.png
"""

import argparse
import os
import re
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap

# 配置参数
COLORS = {
    'bg_blue': '#E8F4FD',      # 浅蓝背景
    'bg_pink': '#FCE4EC',      # 浅粉背景  
    'bg_green': '#E8F5E9',     # 浅绿背景
    'bg_purple': '#F3E5F5',    # 浅紫背景
    'text_dark': '#333333',    # 深色文字
    'highlight_pink': '#FFB6C1', # 粉色高亮
    'highlight_yellow': '#FFF59D', # 黄色高亮
    'highlight_green': '#C8E6C9',  # 绿色高亮
    'border': '#BDBDBD',       # 边框灰
}

class CardGenerator:
    def __init__(self, width=800, bg_color='bg_blue'):
        self.width = width
        self.padding = 60
        self.line_spacing = 20
        self.bg_color = COLORS.get(bg_color, COLORS['bg_blue'])
        
        # 尝试加载字体
        self.font_paths = [
            # macOS 中文字体
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/Library/Fonts/Arial Unicode.ttf",
            # Linux
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
            "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
            # 通用
            "/System/Library/Fonts/Helvetica.ttc",
        ]
        
        self.title_font = self._load_font(48, bold=True)
        self.body_font = self._load_font(36)
        self.small_font = self._load_font(24)
        
    def _load_font(self, size, bold=False):
        """尝试加载字体，失败则用默认字体"""
        for path in self.font_paths:
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except:
                    pass
        return ImageFont.load_default()
    
    def get_text_size(self, text, font):
        """获取文字尺寸"""
        img = Image.new('RGB', (1, 1))
        draw = ImageDraw.Draw(img)
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    
    def wrap_text(self, text, font, max_width):
        """自动换行"""
        words = text
        lines = []
        current_line = ""
        
        for char in words:
            test_line = current_line + char
            w, h = self.get_text_size(test_line, font)
            if w <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = char
        
        if current_line:
            lines.append(current_line)
        
        return lines
    
    def parse_highlights(self, text):
        """解析高亮标记 [[文本]] 或 {{文本}}"""
        # [[文本]] = 粉色高亮
        # {{文本}} = 黄色高亮
        pattern = r'(\[\[([^\]]+)\]\]|\{\{([^\}]+)\}\})'
        
        parts = []
        last_end = 0
        
        for match in re.finditer(pattern, text):
            # 添加普通文本
            if match.start() > last_end:
                parts.append(('normal', text[last_end:match.start()]))
            
            # 处理高亮
            if match.group(2):  # [[...]]
                parts.append(('highlight_pink', match.group(2)))
            elif match.group(3):  # {{...}}
                parts.append(('highlight_yellow', match.group(3)))
            
            last_end = match.end()
        
        # 添加剩余文本
        if last_end < len(text):
            parts.append(('normal', text[last_end:]))
        
        return parts
    
    def draw_rounded_rect(self, draw, xy, radius, fill):
        """绘制圆角矩形"""
        x1, y1, x2, y2 = xy
        draw.rounded_rectangle(xy, radius=radius, fill=fill)
    
    def draw_text_with_highlights(self, draw, x, y, text, font, max_width, line_height):
        """绘制带高亮的文字，返回绘制后的 y 坐标"""
        parts = self.parse_highlights(text)
        current_x = x
        current_y = y
        
        for part_type, part_text in parts:
            if part_type == 'normal':
                # 普通文字 - 需要按字符处理换行
                for char in part_text:
                    char_w, char_h = self.get_text_size(char, font)
                    
                    # 检查是否需要换行
                    if current_x + char_w > x + max_width:
                        current_x = x
                        current_y += line_height
                    
                    # 绘制字符
                    draw.text((current_x, current_y), char, font=font, fill=COLORS['text_dark'])
                    current_x += char_w
                    
            else:
                # 高亮文字
                highlight_color = COLORS.get(part_type, COLORS['highlight_yellow'])
                text_w, text_h = self.get_text_size(part_text, font)
                
                # 检查是否需要换行
                if current_x + text_w > x + max_width:
                    current_x = x
                    current_y += line_height
                
                # 绘制高亮背景
                padding = 6
                self.draw_rounded_rect(
                    draw, 
                    (current_x - padding, current_y - 2, current_x + text_w + padding, current_y + text_h + 4),
                    radius=8,
                    fill=highlight_color
                )
                
                # 绘制文字
                draw.text((current_x, current_y), part_text, font=font, fill=COLORS['text_dark'])
                current_x += text_w
        
        return current_y + line_height
    
    def generate(self, title, body_text, output_path, emoji=None):
        """生成图文卡片"""
        # 计算高度
        max_text_width = self.width - (self.padding * 2)
        
        # 估算标题高度
        title_lines = self.wrap_text(title, self.title_font, max_text_width)
        title_height = len(title_lines) * 70
        
        # 估算正文高度（大致计算）
        body_height = 0
        for line in body_text.split('\n'):
            if line.strip():
                body_height += 60
        
        # 总高度
        total_height = (self.padding * 2) + title_height + 40 + body_height + 100
        
        # 创建画布
        img = Image.new('RGB', (self.width, total_height), self.bg_color)
        draw = ImageDraw.Draw(img)
        
        # 绘制圆角边框（外边框）
        border_width = 4
        draw.rounded_rectangle(
            [(border_width, border_width), (self.width-border_width, total_height-border_width)],
            radius=30,
            outline=COLORS['border'],
            width=border_width
        )
        
        current_y = self.padding
        
        # 绘制标题
        if title:
            # 标题高亮处理
            title_x = self.padding + 20
            title_y = current_y
            
            # 简单处理：如果有[[ ]]就居中显示
            if '[[' in title and ']]' in title:
                # 提取高亮部分
                match = re.search(r'\[\[(.+?)\]\]', title)
                if match:
                    before = title[:match.start()]
                    highlight = match.group(1)
                    after = title[match.end():]
                    
                    # 组合绘制
                    full_text = before + highlight + after
                    text_w, _ = self.get_text_size(full_text, self.title_font)
                    start_x = (self.width - text_w) // 2
                    
                    # 绘制普通部分
                    if before:
                        draw.text((start_x, title_y), before, font=self.title_font, fill=COLORS['text_dark'])
                        start_x += self.get_text_size(before, self.title_font)[0]
                    
                    # 绘制高亮
                    hl_w, hl_h = self.get_text_size(highlight, self.title_font)
                    padding = 8
                    self.draw_rounded_rect(
                        draw,
                        (start_x - padding, title_y - 4, start_x + hl_w + padding, title_y + hl_h + 4),
                        radius=10,
                        fill=COLORS['highlight_pink']
                    )
                    draw.text((start_x, title_y), highlight, font=self.title_font, fill=COLORS['text_dark'])
                    start_x += hl_w
                    
                    # 绘制剩余部分
                    if after:
                        draw.text((start_x, title_y), after, font=self.title_font, fill=COLORS['text_dark'])
            else:
                # 普通标题，居中
                text_w, _ = self.get_text_size(title, self.title_font)
                draw.text(((self.width - text_w) // 2, title_y), title, font=self.title_font, fill=COLORS['text_dark'])
            
            current_y += title_height + 40
        
        # 绘制正文
        body_x = self.padding + 20
        for line in body_text.split('\n'):
            if line.strip():
                current_y = self.draw_text_with_highlights(
                    draw, body_x, current_y, line.strip(), 
                    self.body_font, max_text_width - 40, 60
                )
        
        # 添加装饰表情（如果提供）
        if emoji:
            emoji_font = self._load_font(80)
            emoji_w, emoji_h = self.get_text_size(emoji, emoji_font)
            emoji_x = (self.width - emoji_w) // 2
            draw.text((emoji_x, current_y + 20), emoji, font=emoji_font)
        
        # 保存
        img.save(output_path, quality=95)
        print(f"✅ 已生成: {output_path}")
        return output_path


def main():
    parser = argparse.ArgumentParser(description='生成小红书风格图文卡片')
    parser.add_argument('--text', '-t', required=True, help='正文内容（支持 [[高亮]] 和 {{高亮}} 标记）')
    parser.add_argument('--title', '-T', default='', help='标题')
    parser.add_argument('--output', '-o', default='card.png', help='输出文件路径')
    parser.add_argument('--bg', '-b', default='bg_blue', choices=['bg_blue', 'bg_pink', 'bg_green', 'bg_purple'], 
                        help='背景颜色')
    parser.add_argument('--emoji', '-e', default='🦐', help='底部装饰表情')
    parser.add_argument('--width', '-w', type=int, default=800, help='图片宽度')
    
    args = parser.parse_args()
    
    # 如果没有标题，尝试从文本中提取第一行
    title = args.title
    body = args.text
    
    if not title and '\n' in args.text:
        lines = args.text.split('\n')
        title = lines[0]
        body = '\n'.join(lines[1:])
    
    gen = CardGenerator(width=args.width, bg_color=args.bg)
    gen.generate(title, body, args.output, args.emoji)


if __name__ == '__main__':
    main()
