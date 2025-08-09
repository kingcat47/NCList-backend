## Introduction

**NCList (Navermap Choice List)** was inspired by the experience of using one of Korea’s most popular map apps, **Naver Map**.

In Naver Map, users can “like” or bookmark places they want to remember or visit later — such as restaurants, cafes, hospitals, libraries, or even a friend's house.

However, as your saved list grows, it becomes harder to quickly find the place you need. It’s also common to arrive at a bookmarked location only to discover that it’s closed.

**NCList** solves this problem by providing users with a clean, easy-to-read list of their favorite places — all in one page — along with useful details such as:

- Name of the place
- Business hours
- Current open/closed status
- Location on the map
- …and more

---

## Alternative Approach: Crawling + GPT Processing

We initially considered using Naver’s login and official API to fetch saved places,  
but due to privacy restrictions, Naver does not allow third-party access to a user’s “liked” or bookmarked locations.

Instead, we implemented **a custom crawler** that fetches public place information directly from shared Naver Map links.  
The raw HTML/JSON data is then processed by **GPT** to extract only the necessary parts (e.g., business hours, name, address, category)  
and store them in our database for display in NCList.

---

## Tech Stack
- **Design**: Figma
- **Frontend**: React Native
- **Backend**: NestJS
- **Data Processing**: Custom crawler + GPT
- **Translation**: Refined with AI to avoid stiff or awkward expressions

---

## How to Use

1. **Login via phone number**
    - On first use, go to the **Profile** screen and log in using your phone number.

2. **Get a Naver Map link**
    - In the Naver Map app, find the place you want to save.
    - Tap the **Share** button and copy the link.

3. **Add the place to NCList**
    - Go to the **Add** screen in NCList.
    - Enter the name you want to save for the place and paste the Naver Map link.
    - Wait about **2~4 seconds** for the loading screen to finish — the place will then be added.

4. **Home Screen**
    - Shows each place’s name, location, and whether it’s currently open.
    - Tapping a place opens it directly in Naver Map.
    - Places are sorted **Open → Closing Soon → Closed** and can be filtered by category.

5. **Like Screen**
    - Shows place name and location.
    - Tapping a place lets you choose whether to delete it from your list.
    - Also sorted **Open → Closing Soon → Closed**, with category filtering available.

6. **Profile Screen**
    - Displays the number of places saved per category.
    - Allows you to **log out**.

---

## Note
This is my **first time writing a README**, and some parts were translated into Korean by AI.  
There may be awkward expressions, so I kindly ask for your understanding if anything reads unnaturally.

---

Thank you for reading!
