import { Button, Grid } from 'semantic-ui-react';

const Pagination = ({
  pageInfo: { hasNextPage, hasPreviousPage },
  goToNextPage, goToPreviousPage,
}) => (
  <div className="mt-2">
    <Grid>
      <Grid.Column width={8} className="text-right">
        <Button onClick={goToPreviousPage} disabled={!hasPreviousPage}>Previous page</Button>
      </Grid.Column>
      <Grid.Column width={8}>
        <Button onClick={goToNextPage} disabled={!hasNextPage}>Next page</Button>
      </Grid.Column>
    </Grid>
  </div>
);

export default Pagination;
