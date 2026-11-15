import styled from 'styled-components'

export const StyledBreadCrumbs = styled.nav`
  background-color: #fff;
  padding: 8px 15px;
  font-size: 20px;
  font-weight: 700;
  color:${({ theme }) => theme.colors.grey600};
  text-align: bottom;
  display: flex;
  

  ol {
    
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    color:${({ theme }) => theme.colors.grey600};
    

    li {
      display: inline-block;
      margin-right: 5px;
      font-weight: 700;
      color:${({ theme }) => theme.colors.grey600};
     
      

      &:not(:last-child)::after {
        content: '/';
        
        
      }

      &.active {
        font-weight: 700;
        font-size: 1.5em;      
        
      }

      a {
        color:${({ theme }) => theme.colors.grey600};
        text-decoration: none;

        &:hover {
          color: purple;
        }
      }
    }
  }
`;