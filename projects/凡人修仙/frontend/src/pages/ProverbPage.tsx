import React, { useState, useEffect } from 'react';
import { 
  Scroll, 
  Sparkles, 
  RefreshCw, 
  Heart,
  Quote,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

interface Proverb {
  id: string;
  content: string;
  source: string;
  date: string;
}

const ProverbPage: React.FC = () => {
  const [proverb, setProverb] = useState<Proverb | null>(null);
  const [reflection, setReflection] = useState('');
  const [savedReflections, setSavedReflections] = useState<Array<{ date: string; content: string; proverb: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // 模拟箴言数据
  const mockProverbs: Proverb[] = [
    {
      id: '1',
      content: '天行健，君子以自强不息。',
      source: '《周易》',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      content: '知人者智，自知者明。胜人者有力，自胜者强。',
      source: '《道德经》',
      date: new Date().toISOString(),
    },
    {
      id: '3',
      content: '道可道，非常道；名可名，非常名。',
      source: '《道德经》',
      date: new Date().toISOString(),
    },
    {
      id: '4',
      content: '上善若水，水善利万物而不争。',
      source: '《道德经》',
      date: new Date().toISOString(),
    },
    {
      id: '5',
      content: '为学日益，为道日损。损之又损，以至于无为。',
      source: '《道德经》',
      date: new Date().toISOString(),
    },
    {
      id: '6',
      content: '君子和而不同，小人同而不和。',
      source: '《论语》',
      date: new Date().toISOString(),
    },
    {
      id: '7',
      content: '学而时习之，不亦说乎？',
      source: '《论语》',
      date: new Date().toISOString(),
    },
    {
      id: '8',
      content: '己所不欲，勿施于人。',
      source: '《论语》',
      date: new Date().toISOString(),
    },
    {
      id: '9',
      content: '故不积跬步，无以至千里；不积小流，无以成江海。',
      source: '《荀子》',
      date: new Date().toISOString(),
    },
    {
      id: '10',
      content: '路漫漫其修远兮，吾将上下而求索。',
      source: '《离骚》',
      date: new Date().toISOString(),
    },
  ];

  // 渔樵问对
  const yuQiaoWenDui = [
    {
      id: 'yq1',
      content: '渔者曰：「子知观天地万物之道乎？」樵者曰：「未也，愿闻其详。」渔者曰：「夫所以谓之观物者，非以目观之也；非观之以目，而观之以心也；非观之以心，而观之以理也。」',
      source: '《渔樵问对》',
    },
    {
      id: 'yq2',
      content: '天地之道备于人，万物之道备于身。',
      source: '《渔樵问对》',
    },
    {
      id: 'yq3',
      content: '君子之学，以润身为本；其治人应物，皆余事也。',
      source: '《渔樵问对》',
    },
    {
      id: 'yq4',
      content: '义者，变化之本也。',
      source: '《渔樵问对》',
    },
  ];

  useEffect(() => {
    loadDailyProverb();
    // 从localStorage加载感悟
    const saved = localStorage.getItem('xiu_reflections');
    if (saved) {
      setSavedReflections(JSON.parse(saved));
    }
  }, []);

  const loadDailyProverb = () => {
    setIsLoading(true);
    // 根据日期选择箴言
    const today = new Date().getDate();
    const index = today % mockProverbs.length;
    setProverb(mockProverbs[index]);
    setIsLoading(false);
  };

  const generateNewProverb = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const allProverbs = [...mockProverbs, ...yuQiaoWenDui.map(yq => ({ ...yq, date: new Date().toISOString() }))];
      const randomIndex = Math.floor(Math.random() * allProverbs.length);
      setProverb(allProverbs[randomIndex]);
      setIsGenerating(false);
    }, 500);
  };

  const saveReflection = () => {
    if (!reflection.trim() || !proverb) return;

    const newReflection = {
      date: new Date().toISOString(),
      content: reflection,
      proverb: proverb.content,
    };

    const updated = [newReflection, ...savedReflections];
    setSavedReflections(updated);
    localStorage.setItem('xiu_reflections', JSON.stringify(updated));
    setReflection('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold xiu-title mb-2">每日箴言</h1>
          <p className="text-gray-400">诵读经典，参悟道法</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 箴言卡片 */}
          <div className="lg:col-span-2">
            <div className="xiu-card rounded-2xl p-8 relative overflow-hidden">
              {/* 装饰 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-xiu-gold to-transparent"></div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={generateNewProverb}
                  disabled={isGenerating}
                  className="p-2 rounded-lg text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 transition-all"
                  title="换一条箴言"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-xiu-gold" />
                </div>
              ) : proverb ? (
                <>
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-xiu-gold/10 mb-6">
                      <Quote className="w-8 h-8 text-xiu-gold" />
                    </div>

                    <div className="relative">
                      <span className="absolute -top-4 -left-2 text-6xl text-xiu-gold/20">"""</span>
                      <p className="text-xl sm:text-2xl text-white leading-relaxed font-medium px-8">
                        {proverb.content}
                      </p>
                      <span className="absolute -bottom-8 -right-2 text-6xl text-xiu-gold/20 rotate-180">"""</span>
                    </div>

                    <div className="mt-8 flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4 text-xiu-gold" />
                      <span className="text-xiu-gold">{proverb.source}</span>
                    </div>
                  </div>

                  {/* 感悟输入 */}
                  <div className="mt-8 pt-6 border-t border-xiu-gold/20">
                    <h3 className="text-lg font-semibold text-white mb-4">记录感悟</h3>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="写下你对这条箴言的感悟..."
                      rows={4}
                      className="xiu-input resize-none mb-4"
                    />
                    <button
                      onClick={saveReflection}
                      disabled={!reflection.trim()}
                      className="w-full py-3 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark font-semibold rounded-lg hover:shadow-gold-glow transition-all disabled:opacity-50"
                    >
                      保存感悟
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 今日信息 */}
            <div className="xiu-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-xiu-gold" />
                <span className="font-semibold text-white">今日</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-xiu-gold mb-1">
                  {new Date().getDate()}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date().toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="xiu-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Scroll className="w-5 h-5 text-xiu-cyan" />
                <span className="font-semibold text-white">快捷操作</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={generateNewProverb}
                  className="w-full py-2 px-4 text-left text-sm text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 rounded-lg transition-all"
                >
                  换一条箴言
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="w-full py-2 px-4 text-left text-sm text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10 rounded-lg transition-all"
                >
                  查看历史感悟
                </button>
              </div>
            </div>

            {/* 统计 */}
            <div className="xiu-card rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-white">感悟统计</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-xiu-gold mb-1">
                  {savedReflections.length}
                </div>
                <div className="text-sm text-gray-400">已记录感悟</div>
              </div>
            </div>
          </div>
        </div>

        {/* 历史感悟 */}
        {savedReflections.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold xiu-title mb-6">历史感悟</h2>
            <div className="space-y-4">
              {savedReflections.slice(0, 5).map((item, index) => (
                <div key={index} className="xiu-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                  <blockquote className="text-gray-300 italic mb-3 border-l-2 border-xiu-gold/30 pl-4">
                    {item.proverb}
                  </blockquote>
                  <p className="text-white">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProverbPage;
