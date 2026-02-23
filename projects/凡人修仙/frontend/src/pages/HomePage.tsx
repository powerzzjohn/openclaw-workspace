import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, BookOpen, MessageCircle, Scroll, ChevronRight, Star, Wind, Flame, Droplets, Mountain } from 'lucide-react';
import { REALM_LIST } from '../types';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: '修炼系统',
      desc: '根据天时地利计算修炼效率，五行相生相克影响修为增长',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: BookOpen,
      title: '八字测算',
      desc: '根据生辰八字测算灵根资质，决定修炼天赋与加成',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageCircle,
      title: 'AI道友',
      desc: '与修仙AI交流问道，解答修炼疑惑，指点迷津',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Scroll,
      title: '每日箴言',
      desc: '诵读经典，参悟道法，记录每日修炼感悟',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const elements = [
    { name: '金', icon: Mountain, color: 'text-gray-300', desc: '锋利刚强' },
    { name: '木', icon: Wind, color: 'text-green-400', desc: '生生不息' },
    { name: '水', icon: Droplets, color: 'text-blue-400', desc: '柔韧变化' },
    { name: '火', icon: Flame, color: 'text-red-400', desc: '热情奔放' },
    { name: '土', icon: Mountain, color: 'text-yellow-400', desc: '厚重包容' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-xiu-cyan/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-xiu-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-xiu-gold/10 border border-xiu-gold/30 mb-8">
            <Sparkles className="w-4 h-4 text-xiu-gold" />
            <span className="text-sm text-xiu-gold">修仙之路，由此启程</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-xiu-gold via-xiu-goldLight to-xiu-gold bg-clip-text text-transparent">
              凡人修仙
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            天地不仁，以万物为刍狗。然凡人亦可逆天改命，踏上修仙之路。
            <br className="hidden sm:block" />
            在这里，你将体验真实的修炼系统，参悟五行之道，追寻长生之法。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/cultivate"
                className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark rounded-xl font-semibold text-lg hover:shadow-gold-glow transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                <span>开始修炼</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark rounded-xl font-semibold text-lg hover:shadow-gold-glow transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>踏上仙途</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 border border-xiu-gold/30 text-xiu-gold rounded-xl font-semibold text-lg hover:bg-xiu-gold/10 transition-all duration-300"
                >
                  道友回归
                </Link>
              </>
            )}
          </div>

          {/* 用户状态卡片 */}
          {isAuthenticated && user && (
            <div className="mt-12 p-6 xiu-card rounded-2xl max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-xiu-gold to-xiu-goldLight flex items-center justify-center text-xiu-dark font-bold text-lg">
                    {user.daoName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{user.daoName}</div>
                    <div className="text-sm text-xiu-gold">{user.realmName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-xiu-gold">{user.currentExp}</div>
                  <div className="text-xs text-gray-400">修为</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">当前境界</span>
                  <span className="text-xiu-cyan">{user.realmName}</span>
                </div>
                <div className="h-2 bg-xiu-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-xiu-gold to-xiu-goldLight rounded-full transition-all duration-500"
                    style={{
                      width: `${(user.currentExp / (REALM_LIST.find(r => r.realm === user.realm + 1)?.requiredExp || user.currentExp + 1000)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="xiu-title">修仙功法</span>
            </h2>
            <p className="text-gray-400">探索天地奥秘，掌握无上神通</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 xiu-card rounded-2xl hover:border-xiu-gold/40 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Elements Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="xiu-title">五行灵根</span>
            </h2>
            <p className="text-gray-400">金木水火土，五行相生相克，决定修炼天赋</p>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {elements.map((el) => {
              const Icon = el.icon;
              return (
                <div
                  key={el.name}
                  className="flex flex-col items-center p-4 xiu-card rounded-xl hover:border-xiu-gold/40 transition-all duration-300 group"
                >
                  <div className={`w-10 h-10 rounded-full bg-xiu-dark flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${el.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`font-bold ${el.color}`}>{el.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{el.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Realms Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              <span className="xiu-title">境界体系</span>
            </h2>
            <p className="text-gray-400">从炼气到真仙，十重境界，步步登天</p>
          </div>

          <div className="space-y-4">
            {REALM_LIST.slice(0, 7).map((realm, index) => (
              <div
                key={realm.realm}
                className="flex items-center space-x-4 p-4 xiu-card rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-xiu-gold/20 to-xiu-gold/5 border border-xiu-gold/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-xiu-gold">{realm.realm}</span>
                </div>
                <div className="flex-grow">
                  <div className="font-semibold text-white">{realm.name}</div>
                  <div className="text-xs text-gray-500">所需修为: {realm.requiredExp.toLocaleString()}</div>
                </div>
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <span className="text-xs text-green-400">入门</span>
                  ) : (
                    <Star className="w-4 h-4 text-xiu-gold/50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-xiu-gold/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>凡人修仙 · 探索天地奥秘</p>
          <p className="mt-2">道可道，非常道；名可名，非常名</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
