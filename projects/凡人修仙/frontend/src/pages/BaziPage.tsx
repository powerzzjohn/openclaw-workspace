import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baziApi } from '../services/api';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Loader2, 
  ChevronRight,
  Mountain,
  Wind,
  Droplets,
  Flame,
  CircleDot
} from 'lucide-react';
import type { BaziResult } from '../types';
import { ELEMENT_COLORS } from '../types';

const BaziPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BaziResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthDate) return;

    setIsLoading(true);
    try {
      const response = await baziApi.calculate();
      if (response.success && response.data) {
        setResult(response.data);
      }
    } catch (err) {
      console.error('八字计算失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case '金': return Mountain;
      case '木': return Wind;
      case '水': return Droplets;
      case '火': return Flame;
      case '土': return CircleDot;
      default: return Sparkles;
    }
  };

  const getElementDescription = (element: string) => {
    const descriptions: Record<string, string> = {
      '金': '金性刚强，主杀伐决断。金灵根者修炼金属性功法事半功倍，性格坚毅果决。',
      '木': '木性生发，主仁慈生长。木灵根者生机旺盛，修炼恢复类法术有加成。',
      '水': '水性柔润，主智慧变化。水灵根者变化多端，修炼幻术类功法得天独厚。',
      '火': '火性炎上，主热情光明。火灵根者攻击力强，修炼火属性法术威力倍增。',
      '土': '土性厚重，主诚信包容。土灵根者防御稳固，修炼土属性功法根基扎实。',
    };
    return descriptions[element] || '五行相生相克，各有妙用。';
  };

  const ElementIcon = result ? getElementIcon(result.primaryElement) : Sparkles;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold xiu-title mb-2">八字测算</h1>
          <p className="text-gray-400">输入生辰八字，测算灵根资质</p>
        </div>

        {!result ? (
          <div className="xiu-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-xiu-gold" />
                    <span>出生日期</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="xiu-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-xiu-gold" />
                    <span>出生时辰（可选）</span>
                  </span>
                </label>
                <select
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="xiu-input"
                >
                  <option value="">请选择时辰</option>
                  <option value="子">子时 (23:00-01:00)</option>
                  <option value="丑">丑时 (01:00-03:00)</option>
                  <option value="寅">寅时 (03:00-05:00)</option>
                  <option value="卯">卯时 (05:00-07:00)</option>
                  <option value="辰">辰时 (07:00-09:00)</option>
                  <option value="巳">巳时 (09:00-11:00)</option>
                  <option value="午">午时 (11:00-13:00)</option>
                  <option value="未">未时 (13:00-15:00)</option>
                  <option value="申">申时 (15:00-17:00)</option>
                  <option value="酉">酉时 (17:00-19:00)</option>
                  <option value="戌">戌时 (19:00-21:00)</option>
                  <option value="亥">亥时 (21:00-23:00)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.birthDate}
                className="w-full py-4 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark font-semibold rounded-xl hover:shadow-gold-glow transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>测算中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>开始测算</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-xiu-gold/20">
              <h3 className="text-sm font-medium text-gray-300 mb-3">测算说明</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-xiu-gold">·</span>
                  <span>根据生辰八字推算五行属性</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-xiu-gold">·</span>
                  <span>灵根决定修炼时的属性加成</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-xiu-gold">·</span>
                  <span>天灵根最佳，伪灵根最次</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-xiu-gold">·</span>
                  <span>五行相生相克影响修炼效率</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="xiu-card rounded-2xl p-8">
            {/* 结果展示 */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${ELEMENT_COLORS[result.primaryElement]?.bg || 'bg-xiu-gold'} bg-opacity-20 mb-4`}>
                <ElementIcon className={`w-10 h-10 ${ELEMENT_COLORS[result.primaryElement]?.color || 'text-xiu-gold'}`} />
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${ELEMENT_COLORS[result.primaryElement]?.color || 'text-white'}`}>
                {result.rootName}
              </h2>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-xiu-gold/10">
                <Sparkles className="w-4 h-4 text-xiu-gold" />
                <span className="text-xiu-gold">灵根加成: {result.rootBonus.toFixed(2)}x</span>
              </div>
            </div>

            {/* 灵根详解 */}
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-xiu-dark/50 rounded-xl">
                <h3 className="font-semibold text-white mb-2">五行属性</h3>
                <p className="text-gray-400">
                  你的主属性是
                  <span className={ELEMENT_COLORS[result.primaryElement]?.color || 'text-white'}>
                    {result.primaryElement}
                  </span>
                  ，{getElementDescription(result.primaryElement)}
                </p>
              </div>

              <div className="p-4 bg-xiu-dark/50 rounded-xl">
                <h3 className="font-semibold text-white mb-2">修炼建议</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>1. 选择{result.primaryElement}属性功法修炼效率最高</p>
                  <p>2. 天时地利中注意五行相生关系</p>
                  <p>3. 灵根加成可显著提升修炼效率</p>
                  <p>4. 与其他道友双修时注意五行配合</p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-3 border border-xiu-gold/30 text-xiu-gold rounded-xl hover:bg-xiu-gold/10 transition-all"
              >
                重新测算
              </button>
              <button
                onClick={() => navigate('/cultivate')}
                className="flex-1 py-3 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark font-semibold rounded-xl hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
              >
                <span>开始修炼</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaziPage;
