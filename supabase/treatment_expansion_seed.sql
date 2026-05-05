-- Tangle treatment catalog expansion candidates
-- Review before running in Supabase. This file avoids duplicate names with NOT EXISTS checks.

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '고압산소치료',
  '관리',
  15,
  99,
  1,
  '고압 산소 환경을 활용하는 회복·항노화 보조 관리입니다. 단독 얼굴 개선 시술이 아니라 피로 회복, 컨디션 관리, 시술 후 회복 보조 관점에서 비교하는 것이 적합합니다.',
  '스킨부스터, 레이저 후 진정관리, 항노화 프로그램',
  '개인 상태에 따라 귀 먹먹함, 압박감 등 불편감이 있을 수 있어 상담 확인 필요',
  '다운타임 거의 없음',
  '필요 시 1회 또는 패키지 관리',
  '회복 보조, 항노화 관리, 다운타임이 적은 관리형 옵션을 원하는 경우'
where not exists (select 1 from public.treatments where name = '고압산소치료');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '수액류·영양주사',
  '관리',
  2,
  13,
  1,
  '마늘주사, 글루타치온, 백옥주사, NAD/NMN 등 컨디션·항산화 목적의 관리형 주사 묶음입니다. 피부 시술의 직접 대체재가 아니라 보조 옵션으로 비교합니다.',
  '고압산소치료, 진정관리, 항노화 프로그램',
  '성분, 기저질환, 알레르기 여부에 따라 적합성이 달라질 수 있음',
  '대부분 당일 일상 가능',
  '필요 시 1회 또는 반복 관리',
  '다운타임이 적은 입문형 관리, 항산화·컨디션 케어에 관심 있는 경우'
where not exists (select 1 from public.treatments where name = '수액류·영양주사');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '줄기세포 혈청 스킨부스터',
  '스킨부스터',
  69,
  440,
  3,
  '혈청 스킨부스터, 인젝션, 커스텀 후관리 등이 결합된 프리미엄 피부재생·항노화 패키지 후보입니다. 회차와 구성에 따라 가격 차이가 커서 패키지 단위 비교가 중요합니다.',
  '고압산소치료, 엑소좀, 리쥬란 HB, 진정관리',
  '붉음, 멍, 엠보싱, 일시적 붓기 가능',
  '당일~수일',
  '1회 또는 3회 이상 패키지',
  '피부결, 재생, 항노화, 고가 패키지 비교가 필요한 경우'
where not exists (select 1 from public.treatments where name = '줄기세포 혈청 스킨부스터');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  'NAD/NMN 주사',
  '관리',
  13,
  13,
  1,
  '항노화와 컨디션 케어 관심군에서 비교되는 프리미엄 영양주사 계열입니다. 효과를 단정하지 않고 보조 관리 후보로 안내해야 합니다.',
  '수액류·영양주사, 항산화 주사, 고압산소치료',
  '성분 적합성, 복용 약물, 기저질환 확인 필요',
  '대부분 당일 일상 가능',
  '상담 후 주기 결정',
  '항노화, 회복, 컨디션 관리에 관심 있는 경우'
where not exists (select 1 from public.treatments where name = 'NAD/NMN 주사');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '포텐자·엑소좀 모공흉터 패키지',
  '모공흉터',
  35,
  67,
  3,
  '포텐자, 엑소좀, 리쥬란S, 진정재생관리 등을 조합해 모공과 흉터성 피부결을 다루는 패키지입니다. 통증과 회복 부담을 함께 비교해야 합니다.',
  '스킨부스터, 진정재생관리, 리쥬란S',
  '붉음, 열감, 딱지, 일시적 색소침착 가능',
  '수일 정도 붉음 가능',
  '피부 상태에 따라 3~5회 이상',
  '모공, 여드름 흉터, 거친 피부결 개선을 원하는 경우'
where not exists (select 1 from public.treatments where name = '포텐자·엑소좀 모공흉터 패키지');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '크라이오 회복관리',
  '관리',
  3,
  10,
  1,
  '냉각·진정 목적의 회복관리 후보입니다. 현재 가격 근거는 추가 수집이 필요하므로 임시 범위로만 관리하고, 운영 반영 전 검증이 필요합니다.',
  '레이저 후 진정관리, LDM, 홍조관리',
  '냉감, 일시적 자극감 가능',
  '다운타임 거의 없음',
  '시술 후 또는 민감 피부 관리 시',
  '붉음, 열감, 시술 후 진정 케어가 필요한 경우'
where not exists (select 1 from public.treatments where name = '크라이오 회복관리');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '피코토닝',
  '색소/레이저',
  10,
  80,
  2,
  '짧은 펄스의 레이저를 활용해 색소, 잡티, 문신 제거 영역에서 비교되는 시술입니다. 병변 종류와 회차에 따라 가격 차이가 큽니다.',
  '진정관리, 미백관리, 스킨부스터',
  '붉음, 따가움, 일시적 색소 변화 가능',
  '당일~수일',
  '반복 관리가 필요한 경우가 많음',
  '색소, 잡티, 문신 제거, 톤 개선을 원하는 경우'
where not exists (select 1 from public.treatments where name = '피코토닝');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '프락셔널 CO2 레이저',
  '모공흉터',
  15,
  100,
  4,
  '피부 표면에 미세한 열 손상을 만들어 재생을 유도하는 레이저 계열입니다. 모공흉터 개선 후보지만 회복 부담을 반드시 비교해야 합니다.',
  '재생관리, 스킨부스터, 진정관리',
  '붉음, 딱지, 색소침착, 열감 가능',
  '수일~1주 이상',
  '피부 상태에 따라 반복',
  '여드름 흉터, 깊은 모공, 거친 피부결이 고민인 경우'
where not exists (select 1 from public.treatments where name = '프락셔널 CO2 레이저');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '마이크로니들링',
  '모공흉터',
  10,
  60,
  3,
  '미세 바늘 자극을 통해 피부결과 모공, 얕은 흉터 개선을 목표로 하는 시술입니다. 재생관리와 함께 비교되는 경우가 많습니다.',
  '엑소좀, 재생관리, 스킨부스터',
  '붉음, 따가움, 감염 예방 관리 필요',
  '수일',
  '3~5회 이상 반복 가능',
  '얕은 흉터, 피부결, 모공 개선을 원하는 경우'
where not exists (select 1 from public.treatments where name = '마이크로니들링');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '혈관레이저',
  '색소/레이저',
  10,
  70,
  2,
  '혈관성 붉음, 홍조, 붉은 자국을 목적으로 비교되는 레이저 계열입니다. 색소 레이저와 적응증이 다르므로 별도 비교가 필요합니다.',
  '진정관리, 홍조관리, LDM',
  '붉음, 멍, 일시적 열감 가능',
  '당일~수일',
  '반복 관리 가능',
  '홍조, 혈관성 붉음, 붉은 여드름 자국이 고민인 경우'
where not exists (select 1 from public.treatments where name = '혈관레이저');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '비침습 바디컨투어링',
  '바디라인',
  20,
  150,
  2,
  '냉각, 고주파, 초음파 등 비침습 장비를 활용해 복부, 팔뚝, 허벅지, 이중턱 등 라인을 비교하는 확장 카테고리입니다.',
  '지방분해주사, 바디 고주파, 유지관리',
  '일시적 붓기, 멍, 감각 둔화, 통증 가능',
  '당일~수일',
  '부위와 장비에 따라 반복',
  '얼굴 외 라인, 복부, 팔뚝, 허벅지, 이중턱 고민을 비교하고 싶은 경우'
where not exists (select 1 from public.treatments where name = '비침습 바디컨투어링');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '리투오 ECM 스킨부스터',
  '스킨부스터',
  30,
  150,
  3,
  'ECM 기반 최신 스킨부스터 후보입니다. 탄력, 모공, 잔주름, 피부 재생 관심군에서 비교되는 고도화 스킨부스터로 정리합니다.',
  '리쥬란, 쥬베룩, 엑소좀, 고압산소치료',
  '붉음, 엠보싱, 멍, 일시적 붓기 가능',
  '당일~수일',
  '피부 상태에 따라 반복',
  '최신 스킨부스터, 탄력, 모공, 잔주름, 피부 재생을 비교하고 싶은 경우'
where not exists (select 1 from public.treatments where name = '리투오 ECM 스킨부스터');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '세르프 리프팅',
  '리프팅',
  50,
  250,
  3,
  '고주파 기반 최신 리프팅 후보입니다. 처짐, 탄력 저하, 턱선 개선을 목표로 써마지·볼뉴머·덴서티 계열과 함께 비교합니다.',
  '스킨부스터, 보톡스, 윤곽 관리',
  '붉음, 열감, 일시적 붓기 가능',
  '당일~수일',
  '상담 후 주기 결정',
  '탄력 저하, 볼 처짐, 턱선 리프팅을 RF 계열로 비교하고 싶은 경우'
where not exists (select 1 from public.treatments where name = '세르프 리프팅');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '볼뉴머 리프팅',
  '리프팅',
  40,
  200,
  3,
  '모노폴라 고주파 기반 리프팅 후보입니다. 피부결, 잔주름, 탄력, 얼굴선 개선을 함께 비교하는 장비형 시술입니다.',
  '스킨부스터, 진정관리, 보톡스',
  '열감, 붉음, 일시적 붓기 가능',
  '당일~수일',
  '상담 후 주기 결정',
  '자연스러운 탄력 개선과 얼굴선 정리를 원하는 경우'
where not exists (select 1 from public.treatments where name = '볼뉴머 리프팅');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '덴서티 리프팅',
  '리프팅',
  50,
  220,
  3,
  '고주파 기반 리프팅 후보입니다. 얕은 층과 깊은 층 탄력 관리 목적의 장비형 시술로 RF 리프팅 계열과 비교합니다.',
  '스킨부스터, 진정관리, 윤곽 관리',
  '붉음, 열감, 일시적 붓기 가능',
  '당일~수일',
  '상담 후 주기 결정',
  '탄력 저하, 잔주름, 피부 밀도 개선을 RF 계열로 비교하고 싶은 경우'
where not exists (select 1 from public.treatments where name = '덴서티 리프팅');

insert into public.treatments
  (name, category, price_min, price_max, pain_level, description, synergy, side_effects, recovery, cycle, recommended_for)
select
  '리프테라2',
  '리프팅',
  20,
  120,
  3,
  'HIFU 기반 리프팅 후보입니다. 펜 타입 핸드피스 등으로 굴곡진 부위와 세밀한 부위 리프팅에 활용되는 장비형 시술입니다.',
  '슈링크, 보톡스, 스킨부스터',
  '붉음, 통증, 일시적 붓기 가능',
  '당일~수일',
  '상담 후 주기 결정',
  '눈가, 인중, 이중턱, 턱선처럼 굴곡진 부위 리프팅을 비교하고 싶은 경우'
where not exists (select 1 from public.treatments where name = '리프테라2');
