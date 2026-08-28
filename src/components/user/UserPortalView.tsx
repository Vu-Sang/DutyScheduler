import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDuty } from '../../context/DutyContext';
import { DutyAssignment } from '../../types';

import { AvatarImage } from '../common/AvatarImage';
import { AvatarModal } from '../modals/AvatarModal';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';

export const UserPortalView: React.FC = () => {
  const {
    currentUser,
    assignments,
    categories,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    setProofModalOpen,
    setDutyForProof,
    setSelectedAssignmentForDetail,
    employees,
    updateEmployee,
    activeTab,
    setCreateAssignmentModalOpen,
  } = useDuty();

  const isAdmin = currentUser.isManager || currentUser.roleType === 'admin';

  const [activeViewMode, setActiveViewMode] = useState<'timetable' | 'list'>('timetable');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [mobileSelectedDayStr, setMobileSelectedDayStr] = useState<string | null>(null);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Audio / Speech refs and state
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioStopFnRef = useRef<(() => void) | null>(null);
  const [voiceOption, setVoiceOption] = useState<'auto' | 'female' | 'male'>('auto');
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  // Pre-load web speech voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Announcement & Text-to-Speech Voice Broadcast state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState<{
    dateStrFormatted: string;
    todayDuties: DutyAssignment[];
    speechText: string;
    isSpeaking: boolean;
  }>({
    dateStrFormatted: '',
    todayDuties: [],
    speechText: '',
    isSpeaking: false,
  });

  const myEmployeeId = currentUser.employeeId || currentUser.id;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [weekOffset, setWeekOffset] = useState<number>(0);

  useEffect(() => {
    setWeekOffset(0);
  }, [selectedMonth, selectedYear]);

  // Real-time Dynamic Week Calculation (Monday to Sunday based on real today or selected month + weekOffset)
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    
    // Determine target date: If selected month/year is current real month/year, use real today. Otherwise 1st of selected month.
    let targetDate = new Date();
    if (selectedYear !== now.getFullYear() || selectedMonth !== now.getMonth()) {
      targetDate = new Date(selectedYear, selectedMonth, 1);
    }

    // Apply week offset (+7 / -7 days)
    if (weekOffset !== 0) {
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);
    }

    // Get Monday of the target week (0 is Sunday)
    const dayOfWeek = targetDate.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + distanceToMonday);

    const days = [];
    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dateNum = d.getDate();
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
      days.push({
        label: dayLabels[i],
        dateNumber: dateNum,
        dateFormatted: `${String(dateNum).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
        dateStr,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [selectedYear, selectedMonth, weekOffset]);

  const todayDay = currentWeekDays.find(d => d.isToday);
  const activeMobileDayStr = mobileSelectedDayStr && currentWeekDays.some(d => d.dateStr === mobileSelectedDayStr)
    ? mobileSelectedDayStr
    : (todayDay ? todayDay.dateStr : currentWeekDays[0]?.dateStr);

  // My assignments for selected month
  const myMonthAssignments = useMemo(() => {
    return assignments.filter(a => {
      const [y, m] = a.date.split('-').map(Number);
      return a.assignedEmployeeId === myEmployeeId && y === selectedYear && m === selectedMonth + 1;
    });
  }, [assignments, myEmployeeId, selectedMonth, selectedYear]);

  // Penalized assignments list for employee
  const penalizedDuties = useMemo(() => {
    return myMonthAssignments.filter(a => a.penaltyStatus === 'penalty');
  }, [myMonthAssignments]);

  // Computed metrics: Employee completed shifts, penalized shifts, and remaining shifts
  const totalShiftsCount = myMonthAssignments.length;
  const completedShiftsCount = myMonthAssignments.filter(a => a.status === 'completed').length;
  const penalizedShiftsCount = penalizedDuties.length;
  const remainingShiftsCount = Math.max(0, totalShiftsCount - completedShiftsCount);
  const completionPercentage =
    totalShiftsCount > 0 ? Math.round((completedShiftsCount / totalShiftsCount) * 100) : 0;

  // Total fine money lost this month
  const totalFineAmount = penalizedDuties.reduce((sum, a) => sum + (a.fineAmount || 0), 0);

  const handleOpenProofModal = (duty: DutyAssignment) => {
    setDutyForProof(duty);
    setProofModalOpen(true);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioStopFnRef.current) {
      audioStopFnRef.current();
      audioStopFnRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setAnnouncementData(prev => ({ ...prev, isSpeaking: false }));
  };

  const convertNumberToVietnameseWords = (num: number): string => {
    const map: { [key: number]: string } = {
      0: 'không',
      1: 'một',
      2: 'hai',
      3: 'ba',
      4: 'bốn',
      5: 'năm',
      6: 'sáu',
      7: 'bảy',
      8: 'tám',
      9: 'chín',
      10: 'mười',
      11: 'mười một',
      12: 'mười hai',
      13: 'mười ba',
      14: 'mười bốn',
      15: 'mười lăm',
      16: 'mười sáu',
      17: 'mười bảy',
      18: 'mười tám',
      19: 'mười chín',
      20: 'hai mươi',
      21: 'hai mươi mốt',
      22: 'hai mươi hai',
      23: 'hai mươi ba',
      24: 'hai mươi tư',
      25: 'hai mươi lăm',
      26: 'hai mươi sáu',
      27: 'hai mươi bảy',
      28: 'hai mươi tám',
      29: 'hai mươi chín',
      30: 'ba mươi',
      31: 'ba mươi mốt',
    };
    return map[num] || String(num);
  };

  // Ordinal: thứ nhất, thứ hai, thứ tư (not thứ bốn), etc.
  const convertNumberToOrdinal = (num: number): string => {
    const ordinalMap: { [key: number]: string } = {
      1: 'nhất',
      2: 'hai',
      3: 'ba',
      4: 'tư',
      5: 'năm',
      6: 'sáu',
      7: 'bảy',
      8: 'tám',
      9: 'chín',
      10: 'mười',
    };
    return ordinalMap[num] || convertNumberToVietnameseWords(num);
  };

  const formatDateToVietnameseWords = (date: Date): string => {
    const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayOfWeekNames[date.getDay()];

    const dayWord = convertNumberToVietnameseWords(date.getDate());
    const monthWord = convertNumberToVietnameseWords(date.getMonth() + 1);
    const yearNum = date.getFullYear();

    let yearWord = String(yearNum);
    if (yearNum >= 2000 && yearNum < 2100) {
      const lastTwo = yearNum % 100;
      const lastTwoWord = convertNumberToVietnameseWords(lastTwo);
      yearWord = `hai nghìn không trăm ${lastTwoWord}`;
    }

    return `${dayName}, ngày ${dayWord} tháng ${monthWord} năm ${yearWord}`;
  };

  const formatTextForVietnameseTTS = (text: string): string => {
    return text
      .replace(/\bAdmin\b/gi, 'Quản trị viên')
      .replace(/\bCa thứ 1\b/gi, 'Ca số một')
      .replace(/\bCa thứ 2\b/gi, 'Ca số hai')
      .replace(/\bCa thứ 3\b/gi, 'Ca số ba')
      .replace(/\bCa thứ 4\b/gi, 'Ca số bốn')
      .replace(/\bCa thứ 5\b/gi, 'Ca số năm')
      .replace(/\bCa thứ 6\b/gi, 'Ca số sáu')
      .replace(/\bCa thứ 7\b/gi, 'Ca số bảy')
      .replace(/\bCa thứ 8\b/gi, 'Ca số tám')
      .replace(/\bCa thứ 9\b/gi, 'Ca số chín')
      .replace(/\bCa thứ 10\b/gi, 'Ca số mười')
      .replace(/\bCa 1\b/gi, 'Ca số một')
      .replace(/\bCa 2\b/gi, 'Ca số hai')
      .replace(/\bCa 3\b/gi, 'Ca số ba')
      .replace(/\bCa 4\b/gi, 'Ca số bốn')
      .replace(/\bQN\b/g, 'Q N')
      .replace(/\(Cùng trực với ([^)]+)\)/gi, ', phối hợp làm cùng $1,');
  };

  const getAvailableVietnameseVoices = (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    return voices.filter(
      v =>
        v.lang.toLowerCase().includes('vi') ||
        v.name.toLowerCase().includes('vietnamese') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh') ||
        v.name.toLowerCase().includes('tiếng việt')
    );
  };

  const selectBestVoice = (opt: 'auto' | 'female' | 'male'): SpeechSynthesisVoice | undefined => {
    const viVoices = getAvailableVietnameseVoices();
    if (viVoices.length === 0) return undefined;

    if (opt === 'female') {
      const female = viVoices.find(
        v =>
          v.name.toLowerCase().includes('hoaimy') ||
          v.name.toLowerCase().includes('linh') ||
          v.name.toLowerCase().includes('female')
      );
      if (female) return female;
    }

    if (opt === 'male') {
      const male = viVoices.find(
        v =>
          v.name.toLowerCase().includes('namminh') ||
          v.name.toLowerCase().includes('minh') ||
          v.name.toLowerCase().includes('male')
      );
      if (male) return male;
    }

    // Default auto: Preferred Neural / Online / Google voices
    const naturalVoice = viVoices.find(
      v =>
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('online') ||
        v.name.toLowerCase().includes('google')
    );
    return naturalVoice || viVoices[0];
  };

  const speakText = async (
    text: string,
    _overrideVoiceOption?: 'auto' | 'female' | 'male',
    overrideRate?: number
  ) => {
    stopSpeech();
    if (!text) return;

    const rate = overrideRate !== undefined ? overrideRate : speechRate;
    setAnnouncementData(prev => ({ ...prev, isSpeaking: true }));

    const formattedText = formatTextForVietnameseTTS(text);

    // Split text into chunks of max 150 chars at sentence boundaries
    const sentences = formattedText.match(/[^.!?,]+[.!?,]+|[^.!?,]+$/g) || [formattedText];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length <= 150) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        if (sentence.length <= 150) {
          currentChunk = sentence;
        } else {
          const words = sentence.split(' ');
          let temp = '';
          for (const w of words) {
            if ((temp + ' ' + w).length <= 150) {
              temp += (temp ? ' ' : '') + w;
            } else {
              if (temp.trim()) chunks.push(temp.trim());
              temp = w;
            }
          }
          currentChunk = temp;
        }
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    let index = 0;
    let stopped = false;

    audioStopFnRef.current = () => {
      stopped = true;
    };

    const playNextChunk = async () => {
      if (stopped || index >= chunks.length) {
        setAnnouncementData(prev => ({ ...prev, isSpeaking: false }));
        return;
      }

      const chunkText = chunks[index++];

      // Use Vite dev server proxy /gtts -> translate.google.com/translate_tts
      // This avoids browser CORS restriction. Falls back to Web Speech API if proxy fails.
      const proxyUrl = `/gtts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=vi&client=tw-ob`;

      try {
        const res = await fetch(proxyUrl);
        if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
          throw new Error(`Bad response: ${res.status}`);
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        currentAudioRef.current = audio;
        audio.playbackRate = rate;

        audio.onended = () => {
          URL.revokeObjectURL(blobUrl);
          playNextChunk();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          playNextChunk();
        };

        await audio.play();
      } catch (err) {
        // Fallback: Web Speech API with vi-VN language
        console.warn('Google TTS proxy failed, falling back to Web Speech API:', err);
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(chunkText);
          const selectedVoice = selectBestVoice(voiceOption);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang || 'vi-VN';
          } else {
            utterance.lang = 'vi-VN';
          }
          utterance.rate = rate;
          utterance.onend = () => playNextChunk();
          utterance.onerror = () => playNextChunk();
          window.speechSynthesis.speak(utterance);
        } else {
          setAnnouncementData(prev => ({ ...prev, isSpeaking: false }));
        }
      }
    };

    playNextChunk();
  };

  const handleBroadcastTodaySchedule = () => {
    const realNow = new Date();
    const dateFormattedHeader = `${['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][realNow.getDay()]}, ngày ${realNow.getDate()} tháng ${realNow.getMonth() + 1} năm ${realNow.getFullYear()}`;
    const dateFormattedSpeech = formatDateToVietnameseWords(realNow);

    const realTodayDateStr = `${realNow.getFullYear()}-${String(realNow.getMonth() + 1).padStart(2, '0')}-${String(realNow.getDate()).padStart(2, '0')}`;

    const todayDuties = assignments.filter(a => a.date === realTodayDateStr);

    let speechText = `Xin kính chào quý anh chị đồng nghiệp! Hôm nay là ${dateFormattedSpeech}. `;

    if (todayDuties.length === 0) {
      speechText += `Hôm nay cơ quan chúng ta không có ca trực nhật nào được phân công. Chúc quý anh chị một ngày làm việc tràn đầy năng lượng!`;
    } else {
      // Group duties by employee
      const employeeMap = new Map<string, { name: string; duties: typeof todayDuties }>();
      for (const duty of todayDuties) {
        const key = duty.assignedEmployeeId || duty.assignedEmployeeName;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, { name: duty.assignedEmployeeName, duties: [] });
        }
        employeeMap.get(key)!.duties.push(duty);
      }

      const employeeGroups = Array.from(employeeMap.values());
      const empCountWord = convertNumberToVietnameseWords(employeeGroups.length);

      speechText += `Hôm nay có ${empCountWord} nhân viên có ca trực nhật. `;

      employeeGroups.forEach((group, empIdx) => {
        const empNumWord = convertNumberToOrdinal(empIdx + 1);
        const employeeDisplay = group.name.replace(/\bQN\b/g, 'Q N');
        const taskCount = group.duties.length;
        const taskCountWord = convertNumberToVietnameseWords(taskCount);

        if (taskCount === 1) {
          const duty = group.duties[0];
          speechText += `Nhân viên thứ ${empNumWord}: ${employeeDisplay}, phụ trách nhiệm vụ ${duty.categoryName}. `;

          // Only read important notice, skip partner info
          const catObj = categories.find(c => c.id === duty.categoryId || c.name.toLowerCase() === duty.categoryName.toLowerCase());
          const catDesc = catObj?.description;
          let customNotice = duty.notes || '';
          if (catDesc && customNotice.startsWith(catDesc)) {
            customNotice = customNotice.replace(catDesc, '').trim();
          }
          customNotice = customNotice.replace(/\(Cùng trực với [^)]+\)/gi, '').trim();
          if (customNotice) {
            speechText += `Lưu ý: ${customNotice}. `;
          }
        } else {
          speechText += `Nhân viên thứ ${empNumWord}: ${employeeDisplay}, phụ trách ${taskCountWord} nhiệm vụ. `;

          group.duties.forEach((duty, taskIdx) => {
            const taskNumWord = convertNumberToOrdinal(taskIdx + 1);
            speechText += `Nhiệm vụ thứ ${taskNumWord}: ${duty.categoryName}. `;

            // Only read important notice, skip partner info
            const catObj = categories.find(c => c.id === duty.categoryId || c.name.toLowerCase() === duty.categoryName.toLowerCase());
            const catDesc = catObj?.description;
            let customNotice = duty.notes || '';
            if (catDesc && customNotice.startsWith(catDesc)) {
              customNotice = customNotice.replace(catDesc, '').trim();
            }
            customNotice = customNotice.replace(/\(Cùng trực với [^)]+\)/gi, '').trim();
            if (customNotice) {
              speechText += `Lưu ý: ${customNotice}. `;
            }
          });
        }
      });

      speechText += `Chúc các anh chị hoàn thành xuất sắc nhiệm vụ và có một ngày làm việc hiệu quả!`;
    }

    setAnnouncementData({
      dateStrFormatted: dateFormattedHeader,
      todayDuties,
      speechText,
      isSpeaking: false,
    });
    setAnnouncementModalOpen(true);
  };



  const months = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 3, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' },
  ];

  return (
    <div id="user-portal-view" className="space-y-6 animate-in fade-in duration-200">
      {/* User Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#004bb8] to-[#0052cc] rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div
            onClick={() => setAvatarModalOpen(true)}
            className="w-16 h-16 rounded-full bg-white/20 overflow-hidden border-2 border-white/40 shrink-0 shadow-xs cursor-pointer group relative hover:ring-4 hover:ring-white/40 transition-all"
            title="Nhấp để đổi ảnh đại diện"
          >
            <AvatarImage src={currentUser.avatar} name={currentUser.name} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[24px] sm:text-[28px] font-extrabold">Xin chào, {currentUser.name}! 👋</h2>
              <button
                onClick={() => setPasswordModalOpen(true)}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-bold border border-white/30 flex items-center gap-1 transition-colors cursor-pointer"
                title="Đổi mật khẩu tài khoản"
              >
                <span className="material-symbols-outlined text-[14px]">key</span>
                Đổi MK
              </button>
            </div>
            <p className="text-[13px] text-white/80 font-medium mt-0.5">
              Thời khóa biểu trực nhật & báo cáo hiệu suất cá nhân Tháng {selectedMonth + 1}/{selectedYear}.
            </p>
          </div>
        </div>

        {/* Circular Performance Gauge & Financial Penalty Stats Widget (USERS ONLY) */}
        {!isAdmin && (
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-wrap items-center gap-6 shadow-lg w-full lg:w-auto justify-between sm:justify-start">
          {/* 1. Circular SVG Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#82f9be] transition-all duration-700 ease-out"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[16px] font-black leading-none text-white">{completionPercentage}%</span>
              <span className="text-[9px] font-medium text-white/80 mt-0.5">Tiến độ</span>
            </div>
          </div>

          {/* 2. Shift Completion Counter Breakdown */}
          <div className="space-y-1 text-left border-r border-white/20 pr-6">
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Tiến độ ca trực</p>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
              <span>Đã trực:</span>
              <strong className="text-[#82f9be] text-[15px] font-extrabold">{completedShiftsCount}</strong>
              <span className="text-white/70">/{totalShiftsCount} ca</span>
              {penalizedShiftsCount > 0 && (
                <span className="text-[10px] text-[#ff8e8e] font-extrabold bg-white/10 px-1.5 py-0.5 rounded border border-[#ff8e8e]/30">
                  ({penalizedShiftsCount} ca bị phạt)
                </span>
              )}
            </div>
            <p className="text-[12px] font-semibold text-white/90">
              Cần trực nữa: <strong className="text-[#ffca81] text-[14px] font-extrabold">{remainingShiftsCount} ca</strong>
            </p>
          </div>

          {/* 3. Interactive Clickable Penalty Money Breakdown */}
          <div
            onClick={() => setShowPenaltyModal(true)}
            className="space-y-1 text-left cursor-pointer hover:bg-white/10 p-2 rounded-xl border border-transparent hover:border-white/30 transition-all group"
            title="Nhấp để xem danh sách ngày phạt & hình ảnh vi phạm"
          >
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Tiền phạt vi phạm</p>
              <span className="material-symbols-outlined text-[14px] text-white/70 group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </div>
            <p className="text-[18px] font-black text-[#ff8e8e] flex items-center gap-1 leading-none">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              {totalFineAmount > 0 ? `-${totalFineAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
            </p>
            <p className="text-[10px] text-white/80 font-medium underline flex items-center gap-0.5">
              {totalFineAmount > 0 ? 'Xem ngày & ảnh vi phạm →' : 'Không bị phạt tiền ✓'}
            </p>
          </div>
        </div>
      )}
    </div>

      {/* CLICKABLE PENALTY BREAKDOWN MODAL */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#c3c6d6] bg-[#fff8f6] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">gavel</span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#ba1a1a]">Chi Tiết Các Lần Vi Phạm Trực Nhật</h3>
                  <p className="text-[12px] text-[#737685] font-medium">Tháng {selectedMonth + 1}/{selectedYear}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="text-[#737685] hover:text-[#041b3c] p-1 rounded hover:bg-[#ffdad6]/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px]">
              {penalizedDuties.length === 0 ? (
                <div className="text-center py-8 text-[#006c47] bg-[#82f9be]/15 rounded-xl border border-[#006c47]/30 space-y-2">
                  <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
                  <p className="font-extrabold text-[15px]">Chúc mừng! Bạn không có ca vi phạm nào trong tháng này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[#ba1a1a] text-white rounded-lg flex justify-between items-center font-bold text-[13px]">
                    <span>Tổng số ca vi phạm: {penalizedDuties.length} ca</span>
                    <span className="text-[15px] font-extrabold">Tổng phạt: -{totalFineAmount.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {penalizedDuties.map((duty, idx) => (
                    <div key={duty.id} className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/40 rounded-xl space-y-3 shadow-2xs">
                      <div className="flex justify-between items-start border-b border-[#ba1a1a]/20 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[15px] text-[#ba1a1a]">Ca #{idx + 1}: {duty.categoryName}</span>
                          </div>
                          <p className="text-[12px] font-bold text-[#041b3c] mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-[#737685]">calendar_today</span>
                            Ngày phạt: {duty.date}
                          </p>
                        </div>

                        <span className="px-3 py-1 bg-[#ba1a1a] text-white rounded-md font-extrabold text-[12px] shadow-2xs">
                          Phạt -{(duty.fineAmount || 50000).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {/* Dirty Proof Photo */}
                      {duty.penaltyImage ? (
                        <div className="space-y-1">
                          <p className="text-[12px] font-bold text-[#ba1a1a] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            Hình ảnh khu vực chưa dọn / dơ (Bằng chứng Admin chụp):
                          </p>
                          <img
                            src={duty.penaltyImage}
                            alt="Bằng chứng vi phạm dơ"
                            className="w-full h-44 object-cover rounded-lg border border-[#ba1a1a]/40 shadow-xs"
                          />
                        </div>
                      ) : (
                        <div className="p-2.5 bg-white/80 rounded border border-[#ba1a1a]/20 text-[12px] text-[#ba1a1a] italic">
                          (Admin không đính kèm hình ảnh minh chứng dơ)
                        </div>
                      )}

                      {/* Admin Reason Note */}
                      {duty.adminNotes && (
                        <div className="p-3 bg-white rounded-lg border border-[#ba1a1a]/30 text-[13px] text-[#041b3c]">
                          <strong className="text-[#ba1a1a]">Nội dung lý do phạt của Admin: </strong> {duty.adminNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#c3c6d6] bg-[#f9f9ff] flex justify-end">
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white font-bold rounded-lg text-[13px] shadow-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation View Tabs */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#c3c6d6] pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveViewMode('timetable')}
            className={`px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewMode === 'timetable'
                ? 'bg-[#003d9b] text-white shadow-xs'
                : 'bg-white text-[#434654] border border-[#c3c6d6] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Thời khóa biểu Tuần (Ma trận)
          </button>

          {!isAdmin && (
            <button
              onClick={() => setActiveViewMode('list')}
              className={`px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeViewMode === 'list'
                  ? 'bg-[#003d9b] text-white shadow-xs'
                  : 'bg-white text-[#434654] border border-[#c3c6d6] hover:bg-[#f1f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              Danh sách của tôi ({myMonthAssignments.length})
            </button>
          )}
        </div>

        {/* Month Picker & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBroadcastTodaySchedule}
            className="px-3.5 py-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] hover:brightness-110 text-white rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer animate-pulse"
            title="Phát loa thông báo lịch trực hôm nay"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            Thông báo ca trực hôm nay
          </button>

          {isAdmin && (
            <button
              onClick={() => setCreateAssignmentModalOpen(true)}
              className="px-3.5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Thêm ca trực mới
            </button>
          )}

          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-[#c3c6d6] text-[#041b3c] font-bold text-[13px] px-3 py-2 rounded-md focus:border-[#003d9b] outline-none cursor-pointer"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: TIMETABLE MATRIX VIEW */}
      {activeViewMode === 'timetable' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-[#c3c6d6] shadow-xs">
            <div>
              <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#041b3c] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003d9b] text-[22px]">table_view</span>
                {isAdmin ? 'Thời khóa biểu Trực nhật Tuần (Toàn cơ quan)' : 'Thời khóa biểu Trực nhật Tuần'}
              </h3>
              <p className="text-[12px] text-[#737685] font-medium mt-0.5">
                {isAdmin
                  ? 'Theo dõi và quản lý lịch trực nhật 7 ngày theo tuần. Bấm vào bất kỳ ca trực nào để chỉnh sửa hoặc phạt vi phạm.'
                  : 'Tất cả các ca của bạn được tô sáng khung xanh dương. Bấm vào "Nộp ảnh" để nộp minh chứng.'}
              </p>
            </div>

            {/* Week Navigation Control Bar */}
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-between sm:justify-end bg-[#f1f3ff] p-1.5 rounded-xl border border-[#c3c6d6]/60">
              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="px-3 py-1.5 bg-white hover:bg-[#003d9b] hover:text-white text-[#041b3c] font-extrabold text-[12px] rounded-lg border border-[#c3c6d6] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                title="Chuyển về 7 ngày trước"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                <span className="hidden sm:inline">Tuần trước</span>
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-1.5 font-extrabold text-[12px] rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  weekOffset === 0
                    ? 'bg-[#003d9b] text-white shadow-xs'
                    : 'bg-white text-[#003d9b] border border-[#c3c6d6] hover:bg-[#003d9b]/10'
                }`}
                title="Quay về tuần hiện tại"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{currentWeekDays[0]?.dateFormatted} - {currentWeekDays[6]?.dateFormatted}</span>
                {weekOffset !== 0 && (
                  <span className="text-[10px] bg-[#ffca81] text-[#5e3c00] font-black px-1.5 py-0.2 rounded-full uppercase">
                    Về hôm nay
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="px-3 py-1.5 bg-white hover:bg-[#003d9b] hover:text-white text-[#041b3c] font-extrabold text-[12px] rounded-lg border border-[#c3c6d6] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                title="Chuyển sang 7 ngày tiếp theo"
              >
                <span className="hidden sm:inline">Tuần sau</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* MOBILE VIEW: Day Picker Strip + Cards (Visible on mobile, hidden on md+) */}
          <div className="block md:hidden space-y-4 mt-4">
            {/* Day Selector Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
              {currentWeekDays.map(day => {
                const isSelected = activeMobileDayStr === day.dateStr;
                const dayAssignments = assignments.filter(a => a.date === day.dateStr);
                const hasMyShift = dayAssignments.some(a => a.assignedEmployeeId === myEmployeeId);

                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setMobileSelectedDayStr(day.dateStr)}
                    className={`flex-1 min-w-[76px] py-2.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative shrink-0 snap-start border ${
                      isSelected
                        ? 'bg-[#003d9b] text-white border-[#003d9b] shadow-md scale-102 font-bold'
                        : day.isToday
                        ? 'bg-[#fff9e6] text-[#041b3c] border-[#ffca81]'
                        : 'bg-white text-[#434654] border-[#c3c6d6]'
                    }`}
                  >
                    {day.isToday && (
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full mb-0.5 ${
                        isSelected ? 'bg-[#ffca81] text-[#5e3c00]' : 'bg-[#003d9b] text-white'
                      }`}>
                        Hôm nay
                      </span>
                    )}
                    <span className="text-[13px] font-extrabold">{day.label}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#737685]'}`}>
                      {day.dateFormatted}
                    </span>

                    {/* Indicator badge for user's shift */}
                    {hasMyShift && (
                      <span className={`mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white text-[#003d9b]' : 'bg-[#003d9b] text-white'
                      }`}>
                        Ca của bạn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Shift Cards Container */}
            {(() => {
              const selectedDayObj = currentWeekDays.find(d => d.dateStr === activeMobileDayStr) || currentWeekDays[0];
              const dayAssignments = assignments.filter(a => a.date === activeMobileDayStr);

              return (
                <div className="bg-white rounded-2xl p-4 border border-[#c3c6d6] shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-[#f0f2f5] pb-2.5">
                    <div>
                      <h4 className="font-extrabold text-[15px] text-[#041b3c] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#003d9b] text-[20px]">calendar_today</span>
                        {selectedDayObj.label} ({selectedDayObj.dateFormatted})
                      </h4>
                      <p className="text-[12px] text-[#737685]">
                        {dayAssignments.length > 0 ? `${dayAssignments.length} ca trực trong ngày` : 'Chưa có lịch trực'}
                      </p>
                    </div>
                    {selectedDayObj.isToday && (
                      <span className="px-2.5 py-1 bg-[#ffca81]/30 text-[#5e3c00] rounded-full text-[11px] font-extrabold border border-[#ffca81]">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {dayAssignments.length === 0 ? (
                    <div className="py-8 text-center text-[#737685] bg-[#f9f9ff] rounded-xl border border-dashed border-[#c3c6d6]">
                      <span className="material-symbols-outlined text-[36px] text-[#737685]/40 mb-1">event_available</span>
                      <p className="text-[13px] font-medium">Không có ca trực nào vào ngày này</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayAssignments.map(duty => {
                        const isMine = duty.assignedEmployeeId === myEmployeeId;
                        const isPenalized = duty.penaltyStatus === 'penalty';
                        const isCompleted = duty.status === 'completed';

                        return (
                          <div
                            key={duty.id}
                            onClick={() => setSelectedAssignmentForDetail(duty)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden space-y-2.5 ${
                              isPenalized
                                ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40'
                                : isMine
                                ? 'bg-[#003d9b]/5 border-[#003d9b]/40 ring-1 ring-[#003d9b]/20 shadow-xs'
                                : 'bg-[#f9f9ff] border-[#c3c6d6]'
                            }`}
                          >
                            {/* Header row: Employee info & status */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#003d9b]/10 text-[#003d9b] font-extrabold flex items-center justify-center text-[13px] border border-[#003d9b]/20">
                                  {duty.assignedEmployeeName.slice(0, 1)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[14px] text-[#041b3c]">
                                    {duty.assignedEmployeeName}
                                  </span>
                                  {isMine && (
                                    <span className="bg-[#003d9b] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                                isPenalized
                                  ? 'bg-[#ba1a1a] text-white'
                                  : isCompleted
                                  ? 'bg-[#82f9be]/30 text-[#006c47]'
                                  : 'bg-[#ffca81]/30 text-[#5e3c00]'
                              }`}>
                                {isPenalized ? (
                                  <>
                                    <span className="material-symbols-outlined text-[13px]">gavel</span>
                                    Vi phạm
                                  </>
                                ) : isCompleted ? (
                                  <>
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    Đã xong
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                                    Chưa trực
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Task details */}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e0e2ec]">
                              <div className="flex items-center gap-2">
                                <span
                                  className="material-symbols-outlined text-[18px]"
                                  style={{ color: duty.categoryColor || '#003d9b' }}
                                >
                                  {duty.categoryIcon || 'task_alt'}
                                </span>
                                <span className="text-[13px] font-bold text-[#041b3c]">
                                  {duty.categoryName}
                                </span>
                              </div>

                              {isMine && !isCompleted && !isPenalized && duty.date === todayStr && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenProofModal(duty);
                                  }}
                                  className="py-1 px-2.5 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-md text-[11px] font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[13px]">add_a_photo</span>
                                  Nộp ảnh
                                </button>
                              )}
                            </div>

                            {/* Fine notification */}
                            {isPenalized && (
                              <div className="p-2 bg-[#ffdad6] text-[#ba1a1a] text-[12px] font-bold rounded-md flex justify-between items-center">
                                <span>Bị phạt vi phạm</span>
                                <span>-{(duty.fineAmount || 50000).toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* DESKTOP VIEW: 7-Column Timetable Matrix (Hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-xl border border-[#c3c6d6] shadow-xs overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-[#c3c6d6] bg-[#f1f3ff] text-center font-bold text-[13px] text-[#041b3c]">
                  {currentWeekDays.map(day => (
                    <div
                      key={day.dateStr}
                      className={`py-3 border-r border-[#c3c6d6] last:border-r-0 relative ${
                        day.isToday ? 'bg-[#003d9b] text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]' : ''
                      }`}
                    >
                      {day.isToday && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#ffca81] text-[#5e3c00] text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm border border-white whitespace-nowrap z-10">
                          HÔM NAY
                        </div>
                      )}
                      <div className="font-extrabold">{day.label}</div>
                      <div className={`text-[11px] font-normal ${day.isToday ? 'text-white/80' : 'text-[#737685]'}`}>
                        {day.dateFormatted}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-[#c3c6d6] bg-[#c3c6d6]">
                  {currentWeekDays.map(day => {
                    const dayAssignments = assignments.filter(a => a.date === day.dateStr);
                    const isMyShift = dayAssignments.some(a => a.assignedEmployeeId === myEmployeeId);

                    return (
                      <div
                        key={day.dateStr}
                        className={`min-h-[200px] p-2 flex flex-col transition-colors relative ${
                          day.isToday 
                            ? 'bg-[#fff9e6] shadow-[inset_0_0_20px_rgba(255,202,129,0.15)]' 
                            : 'bg-white'
                        } ${
                          isMyShift && !day.isToday ? 'bg-[#003d9b]/5' : ''
                        }`}
                      >
                        {/* HÔM NAY border overlay */}
                        {day.isToday && (
                          <div className="absolute inset-0 border-2 border-[#ffca81] pointer-events-none z-10" />
                        )}
                        {/* Day Duty Assignments Badges */}
                        <div className="space-y-2 flex-1">
                          {dayAssignments.length === 0 ? (
                            <span className="text-[11px] text-[#737685]/40 italic block text-center py-4">
                              Chưa xếp
                            </span>
                          ) : (
                            Object.values(
                              dayAssignments.reduce((acc, duty) => {
                                if (!acc[duty.assignedEmployeeId]) {
                                  acc[duty.assignedEmployeeId] = {
                                    employeeName: duty.assignedEmployeeName,
                                    duties: [],
                                    isPenalized: false,
                                    hasCompleted: false,
                                    primaryColor: duty.categoryColor || '#003d9b'
                                  };
                                }
                                acc[duty.assignedEmployeeId].duties.push(duty);
                                if (duty.penaltyStatus === 'penalty') acc[duty.assignedEmployeeId].isPenalized = true;
                                if (duty.status === 'completed') acc[duty.assignedEmployeeId].hasCompleted = true;
                                return acc;
                              }, {} as Record<string, any>)
                            ).map((group: any) => {
                              const { employeeName, duties, isPenalized, hasCompleted, primaryColor } = group;
                              const isMine = duties[0].assignedEmployeeId === myEmployeeId;
                              
                              return (
                                <div
                                  key={duties[0].id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssignmentForDetail(duties[0]);
                                  }}
                                  className={`px-2.5 py-2 rounded-md text-[12px] flex flex-col justify-center cursor-pointer transition-all hover:shadow-xs border-l-[4px] relative overflow-hidden ${
                                    isPenalized
                                      ? 'bg-[#ffdad6]/40 border-l-[#ba1a1a] border-[#ba1a1a]/30'
                                      : isMine
                                      ? 'bg-[#003d9b]/15 border-l-[#003d9b] border-[#003d9b]/50 shadow-[0_2px_10px_rgba(0,61,155,0.15)] ring-1 ring-[#003d9b]/20'
                                      : 'bg-white'
                                  }`}
                                  style={(!isPenalized && !isMine) ? {
                                    borderLeftColor: primaryColor,
                                    backgroundColor: `${primaryColor}12`,
                                    borderColor: `${primaryColor}30`,
                                    borderWidth: '1px',
                                    borderLeftWidth: '4px',
                                  } : { borderWidth: '1px', borderLeftWidth: '4px' }}
                                >
                                  <div className="flex items-center justify-between relative z-10">
                                    <span className={`font-extrabold text-[13px] truncate leading-tight flex flex-1 items-center gap-1 ${isPenalized ? 'text-[#ba1a1a]' : isMine ? 'text-[#003d9b]' : 'text-[#041b3c]'}`}>
                                      {employeeName}
                                      {isMine && <span className="bg-[#003d9b] text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">Bạn</span>}
                                    </span>
                                    {isPenalized ? (
                                      <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] shrink-0 ml-1 font-bold" title="Bị phạt vi phạm">
                                        warning
                                      </span>
                                    ) : hasCompleted ? (
                                      <span className="material-symbols-outlined text-[14px] text-[#006c47] shrink-0 ml-1" title="Đã hoàn thành">
                                        check_circle
                                      </span>
                                    ) : null}
                                  </div>
                                  {duties.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                      {duties.map((d: any) => (
                                        <div 
                                          key={d.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAssignmentForDetail(d);
                                          }}
                                          className="flex items-center justify-between group/task hover:bg-white/60 p-1 rounded transition-colors"
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span 
                                              className="material-symbols-outlined text-[16px] shrink-0" 
                                              style={{ color: d.categoryColor || '#003d9b' }}
                                            >
                                              {d.categoryIcon || 'task_alt'}
                                            </span>
                                            <span className="truncate text-[11px] font-semibold text-[#434654]" title={d.categoryName}>{d.categoryName}</span>
                                          </div>
                                          
                                          {isMine && d.status !== 'completed' && !isPenalized && d.date === todayStr && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenProofModal(d);
                                              }}
                                              className="ml-1 opacity-0 group-hover/task:opacity-100 py-0.5 px-1.5 bg-[#003d9b] text-white rounded text-[9px] font-extrabold hover:bg-[#0052cc] transition-all flex items-center gap-1 shrink-0"
                                              title="Nộp ảnh minh chứng"
                                            >
                                              <span className="material-symbols-outlined text-[11px]">add_a_photo</span>
                                              Nộp
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {activeViewMode === 'list' && (
        <div className="bg-white rounded-xl border border-[#c3c6d6] p-6 shadow-xs space-y-4">
          <h3 className="text-[18px] font-bold text-[#041b3c]">
            Danh sách ca trực của tôi trong Tháng {selectedMonth + 1}/{selectedYear}
          </h3>

          {myMonthAssignments.length === 0 ? (
            <div className="p-8 text-center text-[#737685] bg-[#f9f9ff] rounded-lg border border-[#c3c6d6]">
              <span className="material-symbols-outlined text-[40px] text-[#737685]/50 mb-2">event_busy</span>
              <p className="font-semibold">Bạn không có ca trực nào trong tháng này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myMonthAssignments.map(duty => {
                const isPenalized = duty.penaltyStatus === 'penalty';
                return (
                  <div
                    key={duty.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      isPenalized
                        ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40 hover:border-[#ba1a1a]'
                        : 'bg-[#f9f9ff] border-[#c3c6d6] hover:border-[#003d9b]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ color: isPenalized ? '#ba1a1a' : (duty.categoryColor || '#003d9b') }}
                          >
                            {duty.categoryIcon || 'task_alt'}
                          </span>
                          <h4 className="font-bold text-[15px] text-[#041b3c]">{duty.categoryName}</h4>
                        </div>
                        <p className="text-[12px] text-[#737685] mt-1 font-medium">📅 Ngày: {duty.date}</p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isPenalized
                            ? 'bg-[#ba1a1a] text-white'
                            : duty.status === 'completed'
                            ? 'bg-[#82f9be]/30 text-[#006c47]'
                            : 'bg-[#ffca81]/30 text-[#5e3c00]'
                        }`}
                      >
                        {isPenalized ? '⚠️ Bị phạt vi phạm' : duty.status === 'completed' ? 'Đã hoàn thành' : 'Chưa trực'}
                      </span>
                    </div>

                    {isPenalized && (
                      <div className="p-2.5 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-[#ba1a1a] text-[12px] font-bold flex items-center justify-between">
                        <span>Bị phạt vi phạm trực nhật</span>
                        <span>-{duty.fineAmount?.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}

                    {duty.proofImage ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-[#006c47]">✓ Đã nộp ảnh minh chứng thực tế</p>
                        <img src={duty.proofImage} alt="Minh chứng" className="w-full h-28 object-cover rounded-lg border border-[#c3c6d6]" />
                      </div>
                    ) : !isPenalized && (
                      duty.date === todayStr ? (
                        <button
                          onClick={() => handleOpenProofModal(duty)}
                          className="w-full py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                          Nộp ảnh minh chứng trực nhật
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-[#f1f3ff] border border-[#c3c6d6] text-[#737685] rounded-lg text-[12px] font-semibold text-center flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">event_busy</span>
                          Chỉ nộp báo cáo vào đúng ngày trực ({duty.date})
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TODAY'S DUTY ANNOUNCEMENT & VOICE BROADCAST MODAL */}
      {announcementModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#c3c6d6] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] text-white flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-white animate-bounce">campaign</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-black uppercase tracking-tight">Thông Báo Ca Trực Hôm Nay</h3>
                  <p className="text-[12px] text-white/90 font-bold">{announcementData.dateStrFormatted}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopSpeech();
                  setAnnouncementModalOpen(false);
                }}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-[13px] bg-[#fdfdfd]">
              {/* Voice Playing Indicator Bar */}
              {announcementData.isSpeaking && (
                <div className="p-3 bg-[#fff9e6] border border-[#ffca81] rounded-xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2 text-[#d97706] font-bold text-[12px]">
                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                    <span>Đang đọc loa thông báo giọng nói...</span>
                  </div>
                  <button
                    onClick={stopSpeech}
                    className="px-2.5 py-1 bg-[#d97706] text-white text-[11px] font-extrabold rounded-md hover:bg-[#b45309] cursor-pointer"
                  >
                    ⏹ Dừng phát
                  </button>
                </div>
              )}

              {/* Voice Speed Settings Card */}
              <div className="p-3 bg-[#f1f5f9] border border-[#cbd5e1] rounded-xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#003d9b]">speed</span>
                  <span className="text-[12px] font-black text-[#334155]">Tốc độ phát giọng Google Dịch:</span>
                </div>
                <select
                  value={speechRate}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSpeechRate(val);
                    speakText(announcementData.speechText, 'auto', val);
                  }}
                  className="w-full text-[12px] font-extrabold bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-[#0f172a] focus:outline-none focus:border-[#003d9b] shadow-2xs"
                >
                  <option value={0.75}>🐢 0.75x — Rất chậm & rõ từng chữ</option>
                  <option value={0.85}>🐌 0.85x — Chậm rãi, dễ nghe</option>
                  <option value={1.0}>⭐ 1.0x — Tiêu chuẩn (Khuyên dùng)</option>
                  <option value={1.15}>⚡ 1.15x — Nhanh hơn một chút</option>
                  <option value={1.3}>🚀 1.3x — Nhanh</option>
                  <option value={1.5}>💨 1.5x — Rất nhanh</option>
                  <option value={1.75}>⚡⚡ 1.75x — Siêu nhanh</option>
                </select>
              </div>

              {announcementData.todayDuties.length === 0 ? (
                <div className="py-8 text-center bg-[#82f9be]/15 rounded-xl border border-[#006c47]/30 space-y-2 p-4">
                  <span className="material-symbols-outlined text-[42px] text-[#006c47]">event_available</span>
                  <h4 className="font-extrabold text-[16px] text-[#006c47]">Không Có Ca Trực Hôm Nay</h4>
                  <p className="text-[13px] text-[#041b3c] font-medium">Hôm nay cơ quan không có lịch phân công trực nhật nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-extrabold text-[#041b3c] text-[14px]">
                    Danh sách {announcementData.todayDuties.length} ca trực nhật hôm nay:
                  </p>

                  {announcementData.todayDuties.map((duty, idx) => {
                    const catObj = categories.find(c => c.id === duty.categoryId || c.name.toLowerCase() === duty.categoryName.toLowerCase());
                    const catDesc = catObj?.description;
                    
                    let customNotice = duty.notes || '';
                    if (catDesc && customNotice.startsWith(catDesc)) {
                      customNotice = customNotice.replace(catDesc, '').trim();
                    }
                    const partnerMatch = customNotice.match(/\(Cùng trực với [^)]+\)/);
                    const partnerInfo = partnerMatch ? partnerMatch[0] : '';
                    customNotice = customNotice.replace(/\(Cùng trực với [^)]+\)/, '').trim();

                    return (
                      <div key={duty.id} className="p-4 rounded-xl border-2 border-[#003d9b]/20 bg-white shadow-xs space-y-3">
                        <div className="flex justify-between items-center border-b border-[#f0f2f5] pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#003d9b] text-white font-extrabold flex items-center justify-center text-[14px] shadow-xs">
                              {duty.assignedEmployeeName.slice(0, 1)}
                            </div>
                            <div>
                              <span className="font-extrabold text-[15px] text-[#041b3c] block">
                                {idx + 1}. {duty.assignedEmployeeName}
                              </span>
                              <span className="text-[11px] text-[#737685] font-medium">{duty.assignedEmployeeRole || 'Nhân viên trực'}</span>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full bg-[#003d9b]/10 text-[#003d9b] font-black text-[12px] border border-[#003d9b]/30">
                            Ca #{idx + 1}
                          </span>
                        </div>

                        {/* Task info */}
                        <div className="flex items-start gap-2.5 bg-[#f1f3ff] p-3 rounded-lg border border-[#c3c6d6]">
                          <span
                            className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
                            style={{ color: duty.categoryColor || '#003d9b' }}
                          >
                            {duty.categoryIcon || 'task_alt'}
                          </span>
                          <div>
                            <span className="font-extrabold text-[#041b3c] text-[13px] block">
                              Nhiệm vụ: {duty.categoryName}
                            </span>
                            {catDesc && (
                              <p className="text-[12px] text-[#434654] font-medium mt-0.5">{catDesc}</p>
                            )}
                            {partnerInfo && (
                              <span className="inline-block mt-1 text-[11px] font-extrabold text-[#003d9b] bg-white px-2 py-0.5 rounded border border-[#003d9b]/20">
                                👥 {partnerInfo.replace(/[()]/g, '')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Admin Important Notice highlight card */}
                        {customNotice && (
                          <div className="p-3 rounded-lg bg-[#fff9e6] border-2 border-[#ffb300] text-[#5e3c00] space-y-1">
                            <div className="flex items-center gap-1.5 font-black text-[12px] text-[#d97706] uppercase">
                              <span className="material-symbols-outlined text-[18px]">campaign</span>
                              <span>Lưu ý quan trọng từ Admin:</span>
                            </div>
                            <p className="text-[13px] font-black text-[#041b3c] bg-white/90 p-2 rounded border border-[#ffca81]">
                              "{customNotice}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#c3c6d6] bg-white flex flex-wrap justify-between items-center gap-2">
              <button
                onClick={() => speakText(announcementData.speechText)}
                className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-[13px] rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                Phát giọng đọc
              </button>

              <button
                onClick={() => {
                  stopSpeech();
                  setAnnouncementModalOpen(false);
                }}
                className="px-5 py-2 bg-[#041b3c] hover:bg-[#003d9b] text-white text-[13px] font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modals */}
      <AvatarModal isOpen={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} />
      <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
};
