# 🧪 Quick Testing Guide

## 🚀 Start Development Server

```bash
cd e:\DA_TotNghiep_Eng\EngApp_Admin_FE\my-react-app
npm run dev
```

Server should start at: **http://localhost:5173**

---

## ✅ Test Checklist

### 1. Test Dashboard (Results Overview)

**URL:** http://localhost:5173/admin/exam-results/dashboard

#### Expected Features:

- [ ] Statistics Cards display correctly

  - [ ] Total Users card (blue)
  - [ ] Total Exams card (green) with breakdown
  - [ ] Average Scores card (orange) with breakdown

- [ ] Period selector works

  - [ ] Switch between Week/Month/Year
  - [ ] Charts update accordingly

- [ ] Charts render

  - [ ] Exam Activity Trends (Bar chart)
  - [ ] Average Score Trends (Line chart)
  - [ ] User Engagement (Doughnut chart)
  - [ ] Recent Activity list

- [ ] Top Performers table displays
  - [ ] Shows top 5 users
  - [ ] Ranks with medals (🥇🥈🥉)
  - [ ] Average scores and total exams

### 2. Test Search Page

**URL:** http://localhost:5173/admin/exam-results/search

#### Expected Features:

- [ ] Search filters display

  - [ ] User Name input
  - [ ] Exam Type dropdown
  - [ ] Min/Max Score inputs
  - [ ] Start/End Date inputs

- [ ] Search functionality

  - [ ] Click "Search" button
  - [ ] Results load and display in table
  - [ ] Pagination shows (if more than 20 results)

- [ ] Results table

  - [ ] Shows all columns correctly
  - [ ] Breakdown column shows Reading/Listening for Full Test
  - [ ] Progress bars work
  - [ ] Badges colored correctly (green/orange/red)

- [ ] View Details

  - [ ] Click "View" button
  - [ ] Modal opens with full details
  - [ ] Shows Reading/Listening breakdown for Full Test
  - [ ] Progress circles animate
  - [ ] Close button works
  - [ ] Print button available

- [ ] Export functionality

  - [ ] "Export to CSV" button appears
  - [ ] Click downloads CSV file
  - [ ] CSV contains all data

- [ ] Pagination
  - [ ] Previous/Next buttons work
  - [ ] Page counter updates
  - [ ] Buttons disable correctly

### 3. Test Navigation

#### Sidebar Menu:

- [ ] New menu item "Exam Results & Analytics" appears
- [ ] Expands/collapses correctly
- [ ] Submenu shows:
  - [ ] Results Dashboard
  - [ ] Search Results
- [ ] Navigation works for both items

#### Routing:

- [ ] Direct URL access works
- [ ] Browser back/forward works
- [ ] Active state highlights correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: Charts not displaying

**Solution:**

```bash
npm install chart.js react-chartjs-2
```

### Issue 2: 404 Not Found on API calls

**Check:**

1. Backend server running on port 8080?
2. API base URL correct in `axiosClient.jsx`
3. Token exists in localStorage

**Test API directly:**

```bash
# Test overview endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/v1/admin/exams/statistics/overview

# Test search endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/v1/admin/exams/results/search?page=0&size=20
```

### Issue 3: 401 Unauthorized

**Solution:**

1. Login first at `/login`
2. Check token in browser console:
   ```javascript
   localStorage.getItem("accessToken");
   ```
3. Verify token not expired

### Issue 4: CORS Error

**Backend needs to allow CORS:**

```java
@CrossOrigin(origins = "http://localhost:5173")
```

### Issue 5: Empty data/No results

**Check:**

1. Backend has sample data?
2. Database contains exam results?
3. User has taken exams?

---

## 📊 Sample Test Data

If backend returns no data, check if database has:

### Users Table

- At least 5-10 users

### Exams Table

- Reading exams
- Listening exams
- Full Test exams

### Exam Results Table

- User exam attempts with scores
- Results with `readingBreakdown` and `listeningBreakdown` for Full Tests

### Expected JSON Response Examples

#### Statistics Overview:

```json
{
  "totalUsers": 50,
  "totalExamsTaken": 230,
  "examsByType": {
    "READING": 80,
    "LISTENING": 70,
    "FULL_TEST": 80
  },
  "averageScores": {
    "reading": 75.5,
    "listening": 72.3,
    "fullTest": 73.8,
    "overall": 73.9
  },
  "topPerformers": [
    {
      "userId": 1,
      "userName": "John Doe",
      "averageScore": 85.5,
      "totalExams": 15
    }
  ],
  "recentActivity": [...]
}
```

#### Search Results:

```json
{
  "content": [
    {
      "resultId": 1,
      "userId": 101,
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "examId": 501,
      "examTitle": "TOEIC Full Test 2024",
      "examType": "FULL_TEST",
      "testDate": "2024-01-02T10:30:00",
      "totalScore": 850,
      "totalCorrect": 170,
      "totalQuestions": 200,
      "totalIncorrect": 30,
      "accuracy": 85.0,
      "readingBreakdown": {
        "score": 425,
        "correct": 85,
        "total": 100,
        "accuracy": 85.0
      },
      "listeningBreakdown": {
        "score": 425,
        "correct": 85,
        "total": 100,
        "accuracy": 85.0
      }
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

---

## 🔍 Browser Console Testing

Open browser console (F12) and test:

```javascript
// Check if components loaded
console.log("Dashboard loaded");

// Check API calls
fetch("http://localhost:8080/api/v1/admin/exams/statistics/overview", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
  },
})
  .then((r) => r.json())
  .then(console.log);

// Check localStorage
console.log("Token:", localStorage.getItem("accessToken"));
```

---

## ✅ Final Verification

After testing all features, verify:

- [ ] All pages load without errors
- [ ] All buttons work
- [ ] All filters work
- [ ] Charts animate smoothly
- [ ] Modals open/close correctly
- [ ] Export downloads files
- [ ] No console errors
- [ ] No broken images/icons
- [ ] Responsive design works (resize browser)
- [ ] Navigation works smoothly

---

## 📸 Expected Screenshots

### Dashboard

![Dashboard should show 3 stat cards, 3 charts, and 1 table]

### Search Results

![Search page should show filters, results table, and pagination]

### Detail Modal

![Modal should show user info, exam info, scores, and breakdown]

---

## 🎯 Performance Checks

- [ ] Initial page load < 3 seconds
- [ ] API calls respond < 1 second
- [ ] Charts render smoothly
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Pagination smooth

---

## 📞 Support

If issues persist:

1. **Check Console**: Look for red errors
2. **Check Network Tab**: See API responses
3. **Check Backend Logs**: Verify endpoints exist
4. **Verify Dependencies**: Run `npm install`
5. **Clear Cache**: Ctrl+Shift+R to hard refresh

---

**Happy Testing! 🎉**
