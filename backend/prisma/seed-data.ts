export const SEED_PASSWORD = 'Password123!';

export const FIRST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Mai', 'Tô', 'Trương',
];

export const LAST_NAMES = [
  'Văn An', 'Thị Bình', 'Minh Châu', 'Văn Đức', 'Thị Em', 'Quốc Huy', 'Thị Lan',
  'Văn Minh', 'Thị Nga', 'Đức Phong', 'Thị Quỳnh', 'Văn Sơn', 'Thị Trang',
  'Hoàng Tuấn', 'Thị Uyên', 'Văn Việt', 'Thị Xuân', 'Văn Yên', 'Thị Hà', 'Minh Khang',
  'Thu Hương', 'Văn Long', 'Thị Mai', 'Đức Anh', 'Thị Hoa', 'Văn Kiệt', 'Thị Linh',
  'Quang Hải', 'Thị Ngọc', 'Văn Phúc', 'Thị Thảo', 'Minh Tuấn', 'Thị Vân',
  'Văn Bảo', 'Thị Chi', 'Đức Dũng', 'Thị Giang', 'Văn Hùng', 'Thị Kim', 'Văn Lộc',
  'Thị My', 'Văn Nam', 'Thị Oanh', 'Văn Phát', 'Thị Quyên', 'Văn Sang',
  'Thị Tâm', 'Văn Uy', 'Thị Vy', 'Văn Xương', 'Thị Yến',
];

export const COURSES = [
  {
    title: 'Lập trình JavaScript',
    description: 'Khóa học JavaScript từ cơ bản đến nâng cao, bao gồm ES6+, async/await và DOM manipulation.',
    slug: 'lap-trinh-javascript',
    difficulty: 'BEGINNER' as const,
    topics: ['JavaScript', 'ES6', 'DOM', 'Async'],
  },
  {
    title: 'Python cho người mới bắt đầu',
    description: 'Học Python từ zero — biến, vòng lặp, hàm, OOP và xử lý file.',
    slug: 'python-cho-nguoi-moi-bat-dau',
    difficulty: 'BEGINNER' as const,
    topics: ['Python', 'OOP', 'Functions', 'File I/O'],
  },
  {
    title: 'Cấu trúc dữ liệu & Giải thuật',
    description: 'Nắm vững array, linked list, tree, graph, sorting và searching algorithms.',
    slug: 'cau-truc-du-lieu-giai-thuat',
    difficulty: 'INTERMEDIATE' as const,
    topics: ['Algorithms', 'Data Structures', 'Sorting', 'Trees'],
  },
  {
    title: 'Phát triển Web với React',
    description: 'Xây dựng ứng dụng web hiện đại với React, hooks, state management và API integration.',
    slug: 'phat-trien-web-react',
    difficulty: 'INTERMEDIATE' as const,
    topics: ['React', 'Hooks', 'State', 'Components'],
  },
  {
    title: 'Cơ sở dữ liệu SQL',
    description: 'Thiết kế database, viết truy vấn SQL, JOIN, index và tối ưu hiệu năng.',
    slug: 'co-so-du-lieu-sql',
    difficulty: 'ADVANCED' as const,
    topics: ['SQL', 'Database', 'JOIN', 'Indexing'],
  },
];

export const LESSON_TITLES = [
  'Giới thiệu khóa học',
  'Cài đặt môi trường',
  'Khái niệm cơ bản',
  'Biến và kiểu dữ liệu',
  'Cấu trúc điều khiển',
  'Hàm và phạm vi',
  'Làm việc với mảng',
  'Xử lý bất đồng bộ',
];

export const ALL_TOPICS = [
  'JavaScript', 'ES6', 'DOM', 'Async', 'Python', 'OOP', 'Functions',
  'Algorithms', 'Data Structures', 'Sorting', 'React', 'Hooks',
  'SQL', 'Database', 'JOIN', 'Trees', 'Components', 'State',
];

export const MCQ_TEMPLATES = [
  'Khái niệm nào sau đây đúng về {topic}?',
  'Trong {topic}, điều gì là quan trọng nhất?',
  'Kết quả của đoạn code liên quan đến {topic} là gì?',
  'Phương pháp nào phù hợp nhất cho {topic}?',
  'Lỗi thường gặp khi làm việc với {topic} là gì?',
];

export const MCQ_OPTIONS = [
  ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
  ['True', 'False', 'Undefined', 'Null'],
  ['Compile-time', 'Runtime', 'Build-time', 'Deploy-time'],
  ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
];
