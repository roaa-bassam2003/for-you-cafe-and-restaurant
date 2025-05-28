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

// Load menu data from JSON files
async function loadMenuData() {
    try {
        // Load restaurant menu
        const restaurantResponse = await fetch('../data/kitchen.json');
        if (!restaurantResponse.ok) {
            throw new Error(`HTTP error! status: ${restaurantResponse.status}`);
        }
        menuData = await restaurantResponse.json();
        console.log('Restaurant menu data loaded successfully:', menuData);
    } catch (error) {
        console.error('Error loading restaurant menu data:', error);
        menuData = { menu: [] };
        alert('خطأ في تحميل بيانات قائمة المطعم. يرجى المحاولة مرة أخرى.');
    }

    try {
        // Load cafe menu
        const cafeResponse = await fetch('../data/bar.json');
        if (!cafeResponse.ok) {
            throw new Error(`HTTP error! status: ${cafeResponse.status}`);
        }
        cafeData = await cafeResponse.json();
        console.log('Cafe menu data loaded successfully:', cafeData);
    } catch (error) {
        console.error('Error loading cafe menu data:', error);
        cafeData = { menu: [] };
        // Don't show alert for cafe data if it doesn't exist yet
        console.log('Cafe menu not available yet');
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
        return allCategories.filter(category => !Object.keys(extrasMapping).includes(category));
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

function showHome() {
    document.getElementById('hero').style.display = 'flex';
    document.getElementById('home').style.display = 'block';
    document.getElementById('restaurant-menu').classList.remove('active');
    document.getElementById('cafe-menu').classList.remove('active');
}

async function showRestaurantMenu() {

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
    document.getElementById('restaurant-menu').classList.add('active');
    document.getElementById('cafe-menu').classList.remove('active');
    showCategories();
}

async function showCafeMenu() {

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
        // Count items including extras for this category
        // const itemCount = getCategoryItems(category).length;

        // categoryDiv.innerHTML = `
        //     <div class="category-image ${backgroundClass}">
        //         <div class="category-count">${itemCount}</div>
        //     </div>
        //     <h3>${category}</h3>
        // `;


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
        // Restaurant logic (unchanged)
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
        // Restaurant logic (unchanged)
        if (sizeFilter === 'Extras') {
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
        
        if (isExtra) {
            itemDiv.classList.add('extras-item');
        }
        if (isSweet) {
            itemDiv.classList.add('sweet-item');
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

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Load menu data when page loads
    await loadMenuData();
    showHome();
});