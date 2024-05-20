import View from './view.js';
import view from './view.js';
import icons from 'url:../../img/icons.svg';

class paginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  //REFACTOR TO METHOD CALLED _generateMarkupButton. (I THINK THIS IS A TO DO)
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    //page one and there is other pages
    if (curPage === 1 && numPages > 1) {
      return `
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
      `;
    }
    //last page
    if (curPage === numPages && numPages > 1) {
      return `
        <button data-goto=${
          curPage - 1
        } class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
            <span>Page ${curPage - 1}</span>
         `;
    }
    //mid page with pages front and back
    if (curPage > 1 && curPage < numPages) {
      return `
        <button data-goto=${
          curPage - 1
        } class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
            <span>Page ${curPage - 1}</span>
          </button>
          </button>
          <button data-goto=${
            curPage + 1
          } class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }
    //page one and it is the only page
    return '';
  }
}

export default new paginationView();
