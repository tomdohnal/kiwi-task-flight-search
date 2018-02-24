import { Button } from 'semantic-ui-react';

const Pagination = ({
  pageInfo: { hasNextPage, hasPreviousPage },
  goToNextPage, goToPreviousPage,
}) => (
  <div>
    {hasPreviousPage && <Button onClick={goToPreviousPage}>Previous page</Button>}
    {hasNextPage && <Button onClick={goToNextPage}>Next page</Button>}
  </div>
);

export default Pagination;
