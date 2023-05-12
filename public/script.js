let mediaGallery = $('#media-gallery')



/**==================================================
 * clears the mediaGallery
 * looks if the creator exist
 * starts the progress of getting all the post from that creator
==================================================**/
$('#search-form').on('submit', async (e) => {
    // makes the page not reload
    e.preventDefault();
    
    let creator = $('#creator').val();
    let mediaType = $('#media-type').val();

    // Clear the previous media
    mediaGallery.empty();
    setLoadingBar(`0% | 0/0`);
    let totalItems = 0;
    
    let response = await fetch(`/fetch-images/${creator}/0`);
    let text = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(text, 'text/html');
    // Gets the total number of posts
    const paginator = doc.querySelector('div.paginator > small');
    if ($(paginator).parent().parent().find('#display-status').text().trim() != 'Displaying most popular artists') {
        const paginatorText = paginator.textContent;
        totalItems = parseInt(paginatorText.substring(paginatorText.indexOf('of') + 2).trim());
    } else {
        stopMassage(`This user do not exist on coomer.party`,false,true)
        return;
    }
    
    for(let i = 0; i != Math.ceil(totalItems/25); i++) {
        // Exit the loop if the creator has changed
        if (creator !== $('#creator').val() || mediaType !== $('#media-type').val()) {
            stopMassage(`Progress stoped!!!`,true,true)
            break;
        }
        
        // Stuff
        response = await fetch(`/fetch-images/${creator}/${i*25}`);
        text = await response.text();
        parser = new DOMParser();
        doc = parser.parseFromString(text, 'text/html');
        
        // Exit the loop if no results are found
        if (doc.querySelector('.no-results')) {
            stopMassage(`Progress stoped!!!`,true,true)
            break;
        }
        
        for(let x = 0; x != 25; x++) {
            // Exit the loop if the creator has changed
            if (creator !== $('#creator').val() || mediaType !== $('#media-type').val()) {
                stopMassage(`Progress stoped!!!`,true,true)
                break;
            }

            const postCard = doc.querySelectorAll('.post-card')[x];
            const PageLink = postCard.querySelector('a');
            if (PageLink) {
                index = i*25+(x+1)

                const PageURL = `https://coomer.party${PageLink.getAttribute('href')}`;
                const PageResponse = await fetch(`/fetch-attachment/${totalItems}/${index}?url=${encodeURIComponent(PageURL)}`);
                const PageText = await PageResponse.text();
                const PageDoc = parser.parseFromString(PageText, 'text/html');
    
                if (mediaType === 'image') {
                    media(PageDoc, 'img', 'fileThumb')
                } else if (mediaType === 'video') {
                    media(PageDoc, 'video', 'post__attachment-link')
                }
                
                setLoadingBar(`${((index/totalItems)*100).toFixed(2)}% | ${index}/${totalItems}`, (index/totalItems)*100) // i*25+(x+1) 0*25+(12+1)=13, 1*25+(12+1)=38
            }
        }
    }
});



/**==================================================
 * Goes back or forward one image/video
==================================================**/
mediaGallery.on('click', '.prev', function() {
    imageSlider($(this), -1)
});
mediaGallery.on('click', '.next', function() {
    imageSlider($(this), 1)
});



/**==================================================
 * Makes a new post
 * @param {object} PageDoc - the post from coomer.party
 * @param {string} Type - if it should be a image or video element
 * @param {string} aTag - what class name the a tag have
==================================================**/
function media(PageDoc, Type, aTag) {
    amount = PageDoc.querySelectorAll('a.'+aTag).length
    if(amount != 0) {
        const Post = document.createElement('div');

        const Title = document.createElement('p');
        Title.innerText = PageDoc.querySelectorAll('div.post__content pre')[0]?.innerText ?? null
        Post.append(Title);

        const Con = document.createElement('div');
        Con.classList.add('Con')
        Post.append(Con);
        
        for(let x = 0; x != amount; x++) {
            const Link = PageDoc.querySelectorAll('a.'+aTag)[x];
            if (Link) {
                const URL = `https://c2.coomer.party${Link.getAttribute('href')}`;
                const Element = document.createElement(Type);
                Element.src = URL;
                if(Type == 'video') {
                    Element.controls = true;
                    Element.preload = 'metadata';
                }
                Con.append(Element);
            }
        }
        
        //adds prev and next btn if there is more then 1 img/vid
        if(amount > 1) {
            const prev = document.createElement('span');
            prev.classList.add('prev')
            prev.style.display = 'none'
            Con.append(prev);
            const next = document.createElement('span');
            next.classList.add('next')
            next.style.display = 'inline-block'
            Con.append(next);
        }
        
        mediaGallery.append(Post);
        $('.Con').last().data('on', 0)
        $('.Con').last().data('max', amount)
        //makes the post red if the post is ppv
        if(Title.innerText.toLowerCase().includes('dm') || Title.innerText.toLowerCase().includes('tip')) {
            $('.Con').last().css('background', '#FF6961');
            $('.Con').last().parent().css('background', '#FF3B30');
        }
    }
}



/**==================================================
 * sends a massage in command-line and updates the loading bar
 * @param {string} text - the text that should be displayed in the loading bar
 * @param {boolean} before - if it should go down one row before typing out the text
 * @param {boolean} after - if it should go down one row after typing out the text
==================================================**/
function stopMassage(text, before, after) {
    fetch(`/writeLine/${text}/${before}/${after}`);
    setLoadingBar(text)
}



/**==================================================
 * Updates the loading bar
 * @param {string} text - the text that should be displayed in the loading bar
 * @param {int} percent - how far the loading bar has come
==================================================**/
function setLoadingBar(text, percent = 0) {
    $('.loadning').attr('data-progress', text);
    $('.loadning').width(`${percent}%`);
}



/**==================================================
 * Changes what image/video that is being displayed
 * @param {object} thisObj - what btn you pressed on
 * @param {int} num - how much you should go back or forward with
==================================================**/
function imageSlider(thisObj, num) {
    amount = thisObj.parent().data('max')-1
    totalOn = thisObj.parent().data('on')+num
    console.log(amount)
    console.log(totalOn)
    for(let i = 0; i != amount; i++) {
        thisObj.parent().children('img, video').eq(i).css('display', 'none')
        thisObj.parent().find('.prev').css('display', 'none')
        thisObj.parent().find('.next').css('display', 'none')
    }
    if(totalOn > 0) {
        thisObj.parent().find('.prev').css('display', 'inline-block')
    }
    if(totalOn < amount) {
        thisObj.parent().find('.next').css('display', 'inline-block')
    }
    thisObj.parent().children('img, video').eq(totalOn).css('display', 'inline')
    thisObj.parent().data('on', totalOn)
}