import { Button } from 'semantic-ui-react';

const Pagination = ({
  pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
  goToNextPage,
}) => (
  <div>
    {hasNextPage && <Button onClick={goToNextPage}>Next page</Button>}
  </div>
);

export default Pagination;
