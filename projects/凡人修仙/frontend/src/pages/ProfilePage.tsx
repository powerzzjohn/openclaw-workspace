import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Sparkles, 
  TrendingUp, 
  Award,
  Edit3,
  Save,
  X,
  Mountain,
  Wind,
  Droplets,
  Flame,
  CircleDot
} from 'lucide-react';
import { REALM_LIST, ELEMENT_COLORS } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDaoName, setEditedDaoName] = useState(user?.daoName || '');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">请登录后查看</div>
      </div>
    );
  }

  const currentRealm = REALM_LIST.find(r => r.realm === user.realm);
  const nextRealm = REALM_LIST.find(r => r.realm === user.realm + 1);
  const progressPercent = nextRealm
    ? (user.currentExp / nextRealm.requiredExp) * 100
    : 100;

  // 模拟灵根数据（实际应该从用户数据中获取）
  const baziData = {
    rootName: '天灵根·火',
    primaryElement: '火',
    rootBonus: 2.0,
    year: '甲午',
    month: '丙寅',
    day: '戊辰',
    hour: '壬子',
  };

  const handleSave = async () => {
    // 这里应该调用API保存修改
    setIsEditing(false);
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

  const ElementIcon = getElementIcon(baziData.primaryElement);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold xiu-title mb-2">个人中心</h1>
          <p className="text-gray-400">查看修为，管理个人信息</p>
        </div>

        {/* 个人信息卡片 */}
        <div className="xiu-card rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-xiu-gold to-xiu-goldLight flex items-center justify-center text-xiu-dark font-bold text-3xl">
                {user.daoName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-xiu-dark border-2 border-xiu-gold flex items-center justify-center">
                <ElementIcon className={`w-4 h-4 ${ELEMENT_COLORS[baziData.primaryElement]?.color || 'text-xiu-gold'}`} />
              </div>
            </div>

            {/* 信息 */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedDaoName}
                      onChange={(e) => setEditedDaoName(e.target.value)}
                      className="xiu-input w-40 text-center"
                    />
                    <button
                      onClick={handleSave}
                      className="p-2 rounded-lg text-green-400 hover:bg-green-400/10"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedDaoName(user.daoName);
                      }}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{user.daoName}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400 mb-4">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-xiu-gold/10 text-xiu-gold text-sm">
                  {user.realmName}
                </span>
                <span className="px-3 py-1 rounded-full bg-xiu-cyan/10 text-xiu-cyan text-sm">
                  {baziData.rootName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 修为进度 */}
          <div className="xiu-card rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-xiu-gold" />
              <span className="font-semibold text-white">修为进度</span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">当前修为</span>
                  <span className="text-xiu-gold">{user.currentExp} / {nextRealm?.requiredExp || '∞'}</span>
                </div>
                <div className="h-4 bg-xiu-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-xiu-gold to-xiu-goldLight rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{currentRealm?.name}</span>
                  <span>{nextRealm?.name || '已满级'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-xiu-dark/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-xiu-gold">{user.currentExp}</div>
                  <div className="text-xs text-gray-400">当前经验</div>
                </div>
                <div className="p-4 bg-xiu-dark/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-xiu-cyan">{user.totalExp}</div>
                  <div className="text-xs text-gray-400">总经验</div>
                </div>
              </div>
            </div>
          </div>

          {/* 灵根信息 */}
          <div className="xiu-card rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="w-5 h-5 text-xiu-cyan" />
              <span className="font-semibold text-white">灵根信息</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-xiu-dark/50 rounded-lg">
                <span className="text-gray-400">灵根类型</span>
                <span className={`font-semibold ${ELEMENT_COLORS[baziData.primaryElement]?.color || 'text-white'}`}>
                  {baziData.rootName}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-xiu-dark/50 rounded-lg">
                <span className="text-gray-400">主属性</span>
                <div className="flex items-center space-x-2">
                  <ElementIcon className={`w-4 h-4 ${ELEMENT_COLORS[baziData.primaryElement]?.color || 'text-white'}`} />
                  <span className={ELEMENT_COLORS[baziData.primaryElement]?.color || 'text-white'}>
                    {baziData.primaryElement}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-xiu-dark/50 rounded-lg">
                <span className="text-gray-400">灵根加成</span>
                <span className="text-xiu-gold font-semibold">{baziData.rootBonus}x</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {['年', '月', '日', '时'].map((label, index) => (
                  <div key={label} className="text-center p-2 bg-xiu-dark/30 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{label}柱</div>
                    <div className="text-sm text-xiu-gold">
                      {[baziData.year, baziData.month, baziData.day, baziData.hour][index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 境界体系 */}
        <div className="mt-6 xiu-card rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Award className="w-5 h-5 text-xiu-gold" />
            <span className="font-semibold text-white">境界体系</span>
          </div>

          <div className="space-y-3">
            {REALM_LIST.slice(0, 7).map((realm) => {
              const isCurrent = realm.realm === user.realm;
              const isPast = realm.realm < user.realm;
              return (
                <div
                  key={realm.realm}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-xiu-gold/20 border border-xiu-gold/30'
                      : isPast
                      ? 'bg-xiu-dark/30 opacity-70'
                      : 'bg-xiu-dark/30 opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-xiu-gold text-xiu-dark'
                        : isPast
                        ? 'bg-xiu-gold/30 text-xiu-gold'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {realm.realm}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                      {realm.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      所需修为: {realm.requiredExp.toLocaleString()}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="px-3 py-1 rounded-full bg-xiu-gold text-xiu-dark text-xs font-semibold">
                      当前
                    </span>
                  )}
                  {isPast && (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      已突破
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
