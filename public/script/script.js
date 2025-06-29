// Global variables
let menuData = { menu: [] };
let cafeData = { menu: [] };
let currentCategory = '';
let currentSizeFilter = 'All';
let currentMenuType = 'restaurant'; // 'restaurant' or 'cafe'

// Category background class mapping
const categoryBackgrounds = {
    // Restaurant categories
    "Meat pizza": "pizza-meat",
    "Pasta white": "pasta-white",
    "Pasta red": "pasta-red",
    "Pizza cheese": "pizza-cheese",
    "Pizza chicken": "pizza-chicken",
    "Pizza seafood": "pizza-seafood",
    "Stuffed crust pizza": "stuffed-crust-pizza",
    "Burger": "burger",
    "Pommes frites": "pommes-frites",
    "Salad": "salad",
    "Extras Meat": "extras-meat",
    "Extras cheese": "extras-cheese",
    "Extras chicken": "extras-chicken",
    "Sandwich": "sandwich", // New combined sandwich category
    // Cafe categories
    "cold coffee": "cold-coffee",
    "Italian Coffee": "italian-coffee",
    "Arabian Style": "arabian-style",
    "Sweet": "sweet-pancake", // Combined category uses pancake background
    "Sweet Pancake": "sweet-pancake",
    "Sweet Waffle": "sweet-waffle",
    "Hot Coffee": "hot-coffee",
    "Hot Drink": "hot-drink",
    "Soft Drink": "soft-drink",
    "Milk Shik": "milk-shik",
    "Ice Cream": "ice-cream",
    "Soda Drink": "soda-drink",
    "Energy Drink": "energy-drink",
    "Smoothie": "smoothie",
    "Cake": "cake",
    "Matcha": "matcha",
    "Feappe": "feappe",
    "Fresh juice": "fresh-juice",
    "Extra": "extra",
};

// Mapping of extras categories to their corresponding main categories
const extrasMapping = {
    "Extras Meat": "Meat pizza",
    "Extras cheese": "Pizza cheese", 
    "Extras chicken": "Pizza chicken"
};

// Mapping for combined sweet categories
const sweetCategoriesMapping = {
    "Sweet Pancake": "Sweet",
    "Sweet Waffle": "Sweet"
};

// Mapping for combined sandwich categories
const sandwichCategoriesMapping = {
    "Sandwich Pick You": "Sandwich",
    "Sandwich": "Sandwich"
};

// Load menu data from JSON files
async function loadMenuData() {
    try {
        // Load restaurant menu
        // test: ./data/kitchen.json 
        // work: ../data/kitchen.json
        const restaurantResponse = await fetch('./data/kitchen.json');
        if (!restaurantResponse.ok) {
            throw new Error(`HTTP error! status: ${restaurantResponse.status}`);
        }
        menuData = await restaurantResponse.json();
    } catch (error) {
        menuData = { menu: [] };
        alert('خطأ في تحميل بيانات قائمة المطعم. يرجى المحاولة مرة أخرى.');
    }

    try {
        // Load cafe menu
        const cafeResponse = await fetch('./data/bar.json');
        if (!cafeResponse.ok) {
            throw new Error(`HTTP error! status: ${cafeResponse.status}`);
        }
        cafeData = await cafeResponse.json();
    } catch (error) {
        cafeData = { menu: [] };
        alert('خطأ في تحميل بيانات قائمة الكافية. يرجى المحاولة مرة أخرى.');
    }
}

// Get current menu data based on menu type
function getCurrentMenuData() {
    return currentMenuType === 'restaurant' ? menuData : cafeData;
}

// Get unique categories
function getCategories() {
    const currentData = getCurrentMenuData();
    const allCategories = [...new Set(currentData.menu.map(item => item.categoryEnglish))];
    
    // Filter out extras categories for restaurant menu only
    if (currentMenuType === 'restaurant') {
        // Filter out extras and sandwich subcategories
        let filteredCategories = allCategories.filter(category => 
            !Object.keys(extrasMapping).includes(category) &&
            !Object.keys(sandwichCategoriesMapping).includes(category)
        );
        
        // Add "Sandwich" category if either sandwich subcategory exists
        const hasSandwiches = allCategories.some(category => 
            Object.keys(sandwichCategoriesMapping).includes(category)
        );
        
        if (hasSandwiches) {
            filteredCategories.push("Sandwich");
        }
        
        return filteredCategories;
    } else {
        // For cafe menu, combine sweet categories
        const filteredCategories = allCategories.filter(category => 
            !Object.keys(sweetCategoriesMapping).includes(category)
        );
        
        // Add "Sweet" category if either Sweet Pancake or Sweet Waffle exists
        const hasSweets = allCategories.some(category => 
            Object.keys(sweetCategoriesMapping).includes(category)
        );
        
        if (hasSweets) {
            filteredCategories.push("Sweet");
        }
        
        return filteredCategories;
    }
}

// Get all items for a category including its corresponding extras (restaurant only) or sweet subcategories (cafe only)
function getCategoryItems(category) {
    const currentData = getCurrentMenuData();
    
    if (currentMenuType === 'restaurant') {
        let items = currentData.menu.filter(item => item.categoryEnglish === category);
        
        // Handle sandwich category specially
        if (category === "Sandwich") {
            items = [];
            Object.keys(sandwichCategoriesMapping).forEach(sandwichCategory => {
                const sandwichItems = currentData.menu.filter(item => item.categoryEnglish === sandwichCategory);
                items = items.concat(sandwichItems);
            });
            return items;
        }
        
        // Find corresponding extras category
        const extrasCategory = Object.keys(extrasMapping).find(key => extrasMapping[key] === category);
        if (extrasCategory) {
            const extrasItems = currentData.menu.filter(item => item.categoryEnglish === extrasCategory);
            items = items.concat(extrasItems);
        }
        
        return items;
    } else {
        // For cafe menu, handle sweet category specially
        if (category === "Sweet") {
            let items = [];
            Object.keys(sweetCategoriesMapping).forEach(sweetCategory => {
                const sweetItems = currentData.menu.filter(item => item.categoryEnglish === sweetCategory);
                items = items.concat(sweetItems);
            });
            return items;
        } else {
            return currentData.menu.filter(item => item.categoryEnglish === category);
        }
    }
}

// Get unique sizes for a category including extras or sweet subcategories
function getCategorySizes(category) {
    const categoryItems = getCategoryItems(category);
    return [...new Set(categoryItems.map(item => item.size))];
}

// Navigation functions
function showSection(sectionId) {
    // Hide all content sections
    const sections = ['home', 'about', 'menu', 'gallery', 'contact'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Hide hero section
    const hero = document.getElementById('hero');
    if (hero) {
        hero.style.display = 'none';
    }
    
    // Hide menu sections
    document.getElementById('restaurant-menu').classList.remove('active');
    document.getElementById('cafe-menu').classList.remove('active');
    
    // Remove showing-menu class from body
    document.body.classList.remove('showing-menu');
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Special handling for home section
    if (sectionId === 'home') {
        const hero = document.getElementById('hero');
        if (hero) {
            hero.style.display = 'flex';
        }
    }
    
    // Update active navigation link
    updateActiveNavLink(sectionId);
    
    // Close mobile menu if open
    closeMobileMenu();
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActiveNavLink(activeSection) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    const activeLink = document.querySelector(`.nav-links a[href="#${activeSection}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.classList.remove('active');
    mobileToggle.classList.remove('active');
}

function showHome() {
    showSection('home');
}

async function showRestaurantMenu() {
    // Add showing-menu class to body to hide navigation and sections
    document.body.classList.add('showing-menu');
    
    // Scroll to the header menu
    const headerMenu = document.getElementById('top-header');
    if (headerMenu) {
        headerMenu.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Make sure menu data is loaded
    if (menuData.menu.length === 0) {
        await loadMenuData();
    }
    
    currentMenuType = 'restaurant';
    document.getElementById('hero').style.display = 'none';
    document.getElementById('home').style.display = 'none';
    
    // Hide all content sections
    const sections = ['about', 'menu', 'gallery', 'contact'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    document.getElementById('restaurant-menu').classList.add('active');
    document.getElementById('cafe-menu').classList.remove('active');
    showCategories();
}

async function showCafeMenu() {
    // Add showing-menu class to body to hide navigation and sections
    document.body.classList.add('showing-menu');
    
    // Scroll to the header menu
    const headerMenu = document.getElementById('top-header');
    if (headerMenu) {
        headerMenu.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Make sure menu data is loaded
    if (cafeData.menu.length === 0) {
        await loadMenuData();
    }
    
    currentMenuType = 'cafe';
    document.getElementById('hero').style.display = 'none';
    document.getElementById('home').style.display = 'none';
    
    // Hide all content sections
    const sections = ['about', 'menu', 'gallery', 'contact'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    document.getElementById('cafe-menu').classList.add('active');
    document.getElementById('restaurant-menu').classList.remove('active');
    showCategories();
}

function showCategories() {
    // Get the appropriate containers based on current menu type
    const categoriesId = currentMenuType === 'restaurant' ? 'categories' : 'cafe-categories';
    const menuItemsId = currentMenuType === 'restaurant' ? 'menu-items' : 'cafe-menu-items';
    
    document.getElementById(categoriesId).style.display = 'grid';
    document.getElementById(menuItemsId).classList.remove('active');

    const categoriesContainer = document.getElementById(categoriesId);
    categoriesContainer.innerHTML = '';

    const categories = getCategories();

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.onclick = () => showCategoryItems(category);

        const backgroundClass = categoryBackgrounds[category] || 'extras-chicken';

        categoryDiv.innerHTML = `
            <div class="category-image ${backgroundClass}">
            </div>
            <h3>${category}</h3>
        `;

        categoriesContainer.appendChild(categoryDiv);
    });
}

function showCategoryItems(category) {
    currentCategory = category;
    currentSizeFilter = 'All';
    
    // Get the appropriate containers based on current menu type
    const categoriesId = currentMenuType === 'restaurant' ? 'categories' : 'cafe-categories';
    const menuItemsId = currentMenuType === 'restaurant' ? 'menu-items' : 'cafe-menu-items';
    const categoryTitleId = currentMenuType === 'restaurant' ? 'category-title' : 'cafe-category-title';
    
    document.getElementById(categoriesId).style.display = 'none';
    document.getElementById(menuItemsId).classList.add('active');

    // Scroll to the header menu
    const headerMenu = document.getElementById('top-header');
    if (headerMenu) {
        headerMenu.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Set category title
    document.getElementById(categoryTitleId).innerHTML = `<h3 style="margin-bottom: 20px; color: #333; font-size: 1.5em;">${category}</h3>`;

    // Initialize size filters for this category
    initializeCategorySizeFilters(category);
    
    // Display all items in category initially
    displayCategoryItems(category, 'All');
}

function initializeCategorySizeFilters(category) {
    const currentData = getCurrentMenuData();
    
    const sizeFiltersId = currentMenuType === 'restaurant' ? 'category-size-filters' : 'cafe-category-size-filters';
    const sizeFiltersContainer = document.getElementById(sizeFiltersId);
    sizeFiltersContainer.innerHTML = '';

    if (currentMenuType === 'restaurant') {
        // Restaurant logic - handle Sandwich category specially
        if (category === 'Sandwich') {
            // Add "All" tab
            const allTab = document.createElement('button');
            allTab.className = 'size-tab active';
            allTab.textContent = 'All Items';
            allTab.onclick = () => filterCategoryBySize('All');
            sizeFiltersContainer.appendChild(allTab);

            // Add Sandwich Pick You tab
            const pickYouItems = currentData.menu.filter(item => item.categoryEnglish === 'Sandwich Pick You');
            if (pickYouItems.length > 0) {
                const pickYouTab = document.createElement('button');
                pickYouTab.className = 'size-tab';
                pickYouTab.textContent = 'Pick You Sandwich';
                pickYouTab.onclick = () => filterCategoryBySize('Pick You');
                sizeFiltersContainer.appendChild(pickYouTab);
            }

            // Add Regular Sandwich tab
            const regularItems = currentData.menu.filter(item => item.categoryEnglish === 'Sandwich');
            if (regularItems.length > 0) {
                const regularTab = document.createElement('button');
                regularTab.className = 'size-tab';
                regularTab.textContent = 'Sandwich';
                regularTab.onclick = () => filterCategoryBySize('Regular');
                sizeFiltersContainer.appendChild(regularTab);
            }
        } else {
            // Regular restaurant category logic
            const mainCategoryItems = currentData.menu.filter(item => item.categoryEnglish === category);
            const mainCategorySizes = [...new Set(mainCategoryItems.map(item => item.size))];
            
            const extrasCategory = Object.keys(extrasMapping).find(key => extrasMapping[key] === category);
            const hasExtras = extrasCategory && currentData.menu.some(item => item.categoryEnglish === extrasCategory);
            
            // Only show tabs if there are multiple sizes OR extras exist
            if (mainCategorySizes.length > 1 || hasExtras) {
                // Add "All" tab
                const allTab = document.createElement('button');
                allTab.className = 'size-tab active';
                allTab.textContent = 'All Items';
                allTab.onclick = () => filterCategoryBySize('All');
                sizeFiltersContainer.appendChild(allTab);

                // Add individual size tabs for main category
                mainCategorySizes.forEach(size => {
                    const sizeTab = document.createElement('button');
                    sizeTab.className = 'size-tab';
                    sizeTab.textContent = `Size ${size}`;
                    sizeTab.onclick = () => filterCategoryBySize(size);
                    sizeFiltersContainer.appendChild(sizeTab);
                });

                // Add extras tab if extras exist
                if (hasExtras) {
                    const extrasTab = document.createElement('button');
                    extrasTab.className = 'size-tab extras-tab';
                    extrasTab.textContent = 'Extras';
                    extrasTab.onclick = () => filterCategoryBySize('Extras');
                    sizeFiltersContainer.appendChild(extrasTab);
                }
            }
        }
    } else {
        // Cafe logic - handle Sweet category specially
        if (category === 'Sweet') {
            // Add "All" tab
            const allTab = document.createElement('button');
            allTab.className = 'size-tab active';
            allTab.textContent = 'All Items';
            allTab.onclick = () => filterCategoryBySize('All');
            sizeFiltersContainer.appendChild(allTab);

            // Add Pancake tab
            const pancakeItems = currentData.menu.filter(item => item.categoryEnglish === 'Sweet Pancake');
            if (pancakeItems.length > 0) {
                const pancakeTab = document.createElement('button');
                pancakeTab.className = 'size-tab';
                pancakeTab.textContent = 'Pancake';
                pancakeTab.onclick = () => filterCategoryBySize('Pancake');
                sizeFiltersContainer.appendChild(pancakeTab);
            }

            // Add Waffle tab
            const waffleItems = currentData.menu.filter(item => item.categoryEnglish === 'Sweet Waffle');
            if (waffleItems.length > 0) {
                const waffleTab = document.createElement('button');
                waffleTab.className = 'size-tab';
                waffleTab.textContent = 'Waffle';
                waffleTab.onclick = () => filterCategoryBySize('Waffle');
                sizeFiltersContainer.appendChild(waffleTab);
            }
        } else {
            // Regular cafe category - check for multiple sizes
            const categoryItems = currentData.menu.filter(item => item.categoryEnglish === category);
            const categorySizes = [...new Set(categoryItems.map(item => item.size))];
            
            if (categorySizes.length > 1) {
                // Add "All" tab
                const allTab = document.createElement('button');
                allTab.className = 'size-tab active';
                allTab.textContent = 'All Items';
                allTab.onclick = () => filterCategoryBySize('All');
                sizeFiltersContainer.appendChild(allTab);

                // Add individual size tabs
                categorySizes.forEach(size => {
                    const sizeTab = document.createElement('button');
                    sizeTab.className = 'size-tab';
                    sizeTab.textContent = `Size ${size}`;
                    sizeTab.onclick = () => filterCategoryBySize(size);
                    sizeFiltersContainer.appendChild(sizeTab);
                });
            }
        }
    }
}

function filterCategoryBySize(size) {
    currentSizeFilter = size;
    
    // Update active tab
    const sizeFiltersId = currentMenuType === 'restaurant' ? 'category-size-filters' : 'cafe-category-size-filters';
    document.querySelectorAll(`#${sizeFiltersId} .size-tab`).forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Display filtered items
    displayCategoryItems(currentCategory, size);
}

function displayCategoryItems(category, sizeFilter) {
    const itemsListId = currentMenuType === 'restaurant' ? 'items-list' : 'cafe-items-list';
    const itemsList = document.getElementById(itemsListId);
    itemsList.innerHTML = '';

    const currentData = getCurrentMenuData();
    let categoryItems;

    if (currentMenuType === 'restaurant') {
        // Restaurant logic - handle Sandwich category specially
        if (category === 'Sandwich') {
            if (sizeFilter === 'Pick You') {
                categoryItems = currentData.menu.filter(item => item.categoryEnglish === 'Sandwich Pick You');
            } else if (sizeFilter === 'Regular') {
                categoryItems = currentData.menu.filter(item => item.categoryEnglish === 'Sandwich');
            } else if (sizeFilter === 'All') {
                categoryItems = getCategoryItems(category);
            } else {
                // Specific size filter for sandwich items
                categoryItems = getCategoryItems(category).filter(item => item.size === sizeFilter);
            }
        } else if (sizeFilter === 'Extras') {
            // Show only extras items
            const extrasCategory = Object.keys(extrasMapping).find(key => extrasMapping[key] === category);
            if (extrasCategory) {
                categoryItems = currentData.menu.filter(item => item.categoryEnglish === extrasCategory);
            } else {
                categoryItems = [];
            }
        } else if (sizeFilter === 'All') {
            // Show all items (main category + extras)
            categoryItems = getCategoryItems(category);
        } else {
            // Show only items of specific size from main category
            categoryItems = currentData.menu.filter(item => 
                item.categoryEnglish === category && item.size === sizeFilter
            );
        }
    } else {
        // Cafe logic - handle Sweet category specially
        if (category === 'Sweet') {
            if (sizeFilter === 'Pancake') {
                categoryItems = currentData.menu.filter(item => item.categoryEnglish === 'Sweet Pancake');
            } else if (sizeFilter === 'Waffle') {
                categoryItems = currentData.menu.filter(item => item.categoryEnglish === 'Sweet Waffle');
            } else if (sizeFilter === 'All') {
                categoryItems = getCategoryItems(category);
            } else {
                // Specific size filter for sweet items
                categoryItems = getCategoryItems(category).filter(item => item.size === sizeFilter);
            }
        } else {
            // Regular cafe category
            if (sizeFilter === 'All') {
                categoryItems = getCategoryItems(category);
            } else {
                categoryItems = currentData.menu.filter(item => 
                    item.categoryEnglish === category && item.size === sizeFilter
                );
            }
        }
    }

    // Sort items
    categoryItems.sort((a, b) => {
        if (currentMenuType === 'restaurant' && sizeFilter === 'All') {
            // When showing all in restaurant, sort main category items before extras
            const aIsExtra = Object.keys(extrasMapping).includes(a.categoryEnglish);
            const bIsExtra = Object.keys(extrasMapping).includes(b.categoryEnglish);
            
            if (aIsExtra !== bIsExtra) {
                return aIsExtra ? 1 : -1; // Main items first, then extras
            }
        }
        
        if (currentMenuType === 'cafe' && category === 'Sweet' && sizeFilter === 'All') {
            // For sweet category, group by subcategory
            if (a.categoryEnglish !== b.categoryEnglish) {
                // Pancakes first, then Waffles
                const order = ['Sweet Pancake', 'Sweet Waffle'];
                return order.indexOf(a.categoryEnglish) - order.indexOf(b.categoryEnglish);
            }
        }
        
        if (currentMenuType === 'restaurant' && category === 'Sandwich' && sizeFilter === 'All') {
            // For sandwich category, group by subcategory
            if (a.categoryEnglish !== b.categoryEnglish) {
                // Sandwich Pick You first, then regular Sandwich
                const order = ['Sandwich Pick You', 'Sandwich'];
                return order.indexOf(a.categoryEnglish) - order.indexOf(b.categoryEnglish);
            }
        }
        
        if (a.size !== b.size) {
            // Sort by size (S, M, L, XL, R, Regular, Large)
            const sizeOrder = ['S', 'M', 'L', 'XL', 'R', 'Regular', 'Large'];
            return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
        }
        return a.price - b.price; // Then by price
    });

    categoryItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        // Add special classes
        const isExtra = currentMenuType === 'restaurant' && Object.keys(extrasMapping).includes(item.categoryEnglish);
        const isSweet = currentMenuType === 'cafe' && Object.keys(sweetCategoriesMapping).includes(item.categoryEnglish);
        const isSandwich = currentMenuType === 'restaurant' && Object.keys(sandwichCategoriesMapping).includes(item.categoryEnglish);
        
        if (isExtra) {
            itemDiv.classList.add('extras-item');
        }
        if (isSweet) {
            itemDiv.classList.add('sweet-item');
        }
        if (isSandwich) {
            itemDiv.classList.add('sandwich-item');
        }

        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.nameArabic}</h4>
                <div class="item-size">Size: ${item.size}</div>
            </div>
            <div class="item-price">${item.price.toFixed(2)}</div>
        `;

        itemsList.appendChild(itemDiv);
    });

    // Show message if no items found
    if (categoryItems.length === 0) {
        const noItemsDiv = document.createElement('div');
        noItemsDiv.style.textAlign = 'center';
        noItemsDiv.style.padding = '40px';
        noItemsDiv.style.color = '#666';
        noItemsDiv.innerHTML = '<h3>لا توجد عناصر في هذا القسم</h3>';
        itemsList.appendChild(noItemsDiv);
    }
}

// Contact form handling
function handleContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Here you would typically send the data to your server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Load menu data when page loads
    await loadMenuData();
    
    // Initialize contact form
    handleContactForm();
    
    // Show home section by default
    showSection('home');
    
    // Handle navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
});
